require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

require("./db");

const { printStartupWarning } = require("./otpService");
const { printCallAgentStartupWarning } = require("./callAgent");

const authRoutes    = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const intakeRoutes  = require("./routes/intake");
const doctorRoutes  = require("./routes/doctor");
const ayushRoutes   = require("./routes/ayush");
const bhasiniRoutes = require("./routes/bhasini");
const decisionTreeRoutes = require("./routes/decisionTree");
const hospitalSettingsRoutes = require("./routes/hospitalSettings");
const mobileUploadRoutes = require("./routes/mobileUpload");
const receptionistRoutes = require("./routes/receptionist");

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(s => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:8000"
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

app.use(cors({
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, "").toLowerCase();

    const isExplicitlyAllowed = allowedOrigins.some(allowed => {
      if (allowed === "*") return true;
      return allowed.toLowerCase() === cleanOrigin;
    });

    const isTrustedHost =
      cleanOrigin.endsWith(".netlify.app") ||
      cleanOrigin.endsWith(".onrender.com") ||
      cleanOrigin.endsWith(".vercel.app") ||
      cleanOrigin.includes("localhost") ||
      cleanOrigin.includes("127.0.0.1");

    if (isExplicitlyAllowed || isTrustedHost || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.options("*", cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api/auth",     authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/sessions", intakeRoutes);
app.use("/api/doctor",   doctorRoutes);
app.use("/api/ayush",    ayushRoutes);
app.use("/api/bhasini",   bhasiniRoutes);
app.use("/api/hospitals", decisionTreeRoutes);
app.use("/api/hospitals", hospitalSettingsRoutes);

app.use("/api", mobileUploadRoutes);

app.use("/api/receptionist", receptionistRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MediKiosk API (Node.js)" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`MediKiosk API listening on http://localhost:${PORT}`);
  printStartupWarning();
  printCallAgentStartupWarning();
});
