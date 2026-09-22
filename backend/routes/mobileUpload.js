const express = require("express");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const { IntakeSession } = require("../db");
const { requireAuth }   = require("../auth");
const { handleDocumentUpload } = require("../documentUpload");

const os = require("os");

const router = express.Router();

const UPLOAD_TOKEN_TTL_MS = 10 * 60 * 1000;
const PORT          = process.env.PORT          || 8000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;

function getLanHost() {
  const envHost = (process.env.KIOSK_LAN_HOST || "").trim();
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  const physical = candidates.find(
    c => !/virtual|vethernet|vbox|loopback|pseudo/i.test(c.name) && !c.address.startsWith("192.168.56.")
  );
  const detectedIp = physical ? physical.address : (candidates[0]?.address || "localhost");

  if (envHost && envHost !== "localhost" && envHost !== "127.0.0.1") {
    const isCurrentlyActive = candidates.some(c => c.address === envHost);
    if (isCurrentlyActive) return envHost;
  }

  return detectedIp;
}

async function validateToken(token, res) {
  let session;
  try {
    session = await IntakeSession.findOne({ upload_token: token });
  } catch (_) {
    res.status(500).json({ valid: false, reason: "server_error" });
    return null;
  }

  if (!session) {
    res.status(404).json({ valid: false, reason: "not_found" });
    return null;
  }

  if (!session.upload_token_expires_at || session.upload_token_expires_at < new Date()) {
    res.status(410).json({ valid: false, reason: "expired" });
    return null;
  }

  return session;
}

router.post("/sessions/:id/upload-token", requireAuth, async (req, res) => {
  try {
    const session = await IntakeSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const activeKioskId = session.kiosk_id || "KIOSK-01";
    await IntakeSession.updateMany(
      {
        kiosk_id: activeKioskId,
        _id: { $ne: session._id },
        upload_token_expires_at: { $gt: new Date() },
      },
      { $set: { upload_token_expires_at: new Date() } }
    );

    const token      = uuidv4();
    const expires_at = new Date(Date.now() + UPLOAD_TOKEN_TTL_MS);

    await IntakeSession.findByIdAndUpdate(session._id, {
      kiosk_id:                activeKioskId,
      upload_token:            token,
      upload_token_expires_at: expires_at,
      upload_token_used:       false,
    });

    const publicAppUrl = (process.env.PUBLIC_APP_URL || "").trim();
    const lanHost = getLanHost();
    const isPublic = !!publicAppUrl;
    res.json({
      token,
      expires_at,
      kiosk_lan_host: isPublic ? publicAppUrl : lanHost,
      port:           PORT,
      frontend_port:  FRONTEND_PORT,
      is_localhost:   isPublic ? false : (lanHost === "localhost" || lanHost === "127.0.0.1"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate upload token" });
  }
});

router.get("/mobile-upload-qr/:token", async (req, res) => {
  try {
    const session = await IntakeSession.findOne({ upload_token: req.params.token });

    if (!session) {
      return res.status(404).json({ error: "Token not found" });
    }
    if (!session.upload_token_expires_at || session.upload_token_expires_at < new Date()) {
      return res.status(410).json({ error: "Token expired" });
    }

    const publicAppUrl = (process.env.PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
    const lanHost = getLanHost();
    const mobileUrl = publicAppUrl
      ? `${publicAppUrl}/mobile-upload/${req.params.token}`
      : `http://${lanHost}:${FRONTEND_PORT}/dhanvantari/mobile-upload/${req.params.token}`;

    const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: { dark: "#1e293b", light: "#ffffff" },
    });

    res.json({ qr_data_url: qrDataUrl, mobile_url: mobileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate QR code" });
  }
});

router.get("/mobile-upload/:token", async (req, res) => {
  const session = await validateToken(req.params.token, res);
  if (!session) return;
  res.json({ valid: true });
});

router.post("/mobile-upload/:token/document", async (req, res) => {
  try {
    const session = await validateToken(req.params.token, res);
    if (!session) return;

    await handleDocumentUpload(session._id.toString(), req, res);
  } catch (err) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
