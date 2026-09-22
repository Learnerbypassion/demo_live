const express = require("express");
const { IntakeSession, Receptionist } = require("../db");
const { requireAuth, requireRole } = require("../auth");

const router = express.Router();

const STALE_CLAIM_MS = 3 * 60 * 1000;

router.get(
  "/queue",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const hospId = req.user.hospital_id;

      const sessions = await IntakeSession.find({
        hospital_id: hospId,
        status: "submitted",
        vitals_status: { $ne: "recorded" },
      }).sort({ red_flag: -1, submitted_at: 1 });

      const claimerIds = [
        ...new Set(
          sessions
            .filter(
              (s) =>
                s.vitals_status === "in_progress" && s.vitals_claimed_by
            )
            .map((s) => s.vitals_claimed_by.toString())
        ),
      ];

      const claimerMap = new Map();
      if (claimerIds.length > 0) {
        const recs = await Receptionist.find({
          _id: { $in: claimerIds },
        }).select("name");
        recs.forEach((r) => claimerMap.set(r.id, r.name));
      }

      const results = sessions.map((s) => {
        const entry = {
          id: s.id,
          session_id: s.id,
          patient_id: s.patient_id,
          token: s.token,
          chief_complaint: s.chief_complaint,
          red_flag: !!s.red_flag,
          red_flag_reason: s.red_flag_reason,
          submitted_at: s.submitted_at,
          vitals_status: s.vitals_status || "pending",
        };

        if (s.vitals_status === "in_progress" && s.vitals_claimed_by) {
          const claimerId = s.vitals_claimed_by.toString();
          entry.vitals_claimed_by = claimerId;
          entry.vitals_claimed_by_name =
            claimerMap.get(claimerId) || "Another receptionist";
          entry.vitals_claimed_at = s.vitals_claimed_at;
        }

        return entry;
      });

      res.json(results);
    } catch (err) {
      res
        .status(500)
        .json({ error: err.message || "Failed to fetch vitals queue" });
    }
  }
);

router.post(
  "/sessions/:id/vitals/claim",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const staleThreshold = new Date(Date.now() - STALE_CLAIM_MS);

      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          $or: [
            { vitals_status: "pending" },
            { vitals_status: { $exists: false } },
            { vitals_status: null },
            {
              vitals_status: "in_progress",
              vitals_claimed_at: { $lt: staleThreshold },
            },
            {
              vitals_status: "in_progress",
              vitals_claimed_by: req.user.id,
            },
          ],
        },
        {
          $set: {
            vitals_status: "in_progress",
            vitals_claimed_by: req.user.id,
            vitals_claimed_at: new Date(),
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(409).json({
          error: "Already being handled by another receptionist",
        });
      }

      res.json({ ok: true, vitals_status: session.vitals_status });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to claim session" });
    }
  }
);

router.post(
  "/sessions/:id/vitals/release",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          vitals_claimed_by: req.user.id,
        },
        {
          $set: {
            vitals_status: "pending",
            vitals_claimed_by: null,
            vitals_claimed_at: null,
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(403).json({
          error:
            "Cannot release: you are not the current claimer of this session",
        });
      }

      res.json({ ok: true, vitals_status: "pending" });
    } catch (err) {
      res
        .status(500)
        .json({ error: err.message || "Failed to release session" });
    }
  }
);

router.patch(
  "/sessions/:id/vitals",
  requireAuth,
  requireRole("receptionist"),
  async (req, res) => {
    try {
      const {
        temperature,
        bp_systolic,
        bp_diastolic,
        pulse,
        spo2,
        weight,
      } = req.body;

      const session = await IntakeSession.findOneAndUpdate(
        {
          _id: req.params.id,
          vitals_status: "in_progress",
          vitals_claimed_by: req.user.id,
        },
        {
          $set: {
            "vitals.temperature": temperature ?? null,
            "vitals.bp_systolic": bp_systolic ?? null,
            "vitals.bp_diastolic": bp_diastolic ?? null,
            "vitals.pulse": pulse ?? null,
            "vitals.spo2": spo2 ?? null,
            "vitals.weight": weight ?? null,
            "vitals.recorded_by": req.user.id,
            "vitals.recorded_at": new Date(),
            vitals_status: "recorded",
            vitals_claimed_by: null,
            vitals_claimed_at: null,
          },
        },
        { new: true }
      );

      if (!session) {
        return res.status(409).json({
          error:
            "Your claim expired or was taken — please try again",
        });
      }

      res.json({ ok: true, vitals_status: "recorded" });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to save vitals" });
    }
  }
);

module.exports = router;
