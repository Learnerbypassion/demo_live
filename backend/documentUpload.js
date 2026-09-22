const path   = require("path");
const fs     = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const { Document } = require("./db");
const { processDocument } = require("./ocr");

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const multerUpload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

function multerMiddleware(req, res) {
  return new Promise((resolve, reject) => {
    multerUpload(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function handleDocumentUpload(sessionId, req, res) {

  try {
    await multerMiddleware(req, res);
  } catch (multerErr) {
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: "File too large. Maximum allowed size is 10 MB. Please compress or crop the document.",
      });
      return false;
    }
    res.status(400).json({ error: multerErr.message || "File upload failed" });
    return false;
  }

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return false;
  }

  const ext       = path.extname(req.file.originalname) || ".png";
  const fname     = `${uuidv4()}${ext}`;
  const finalPath = path.join(UPLOAD_DIR, fname);
  fs.renameSync(req.file.path, finalPath);

  const ocrEnabled = process.env.OCR_ENABLED !== "false";
  if (!ocrEnabled) {
    try { fs.unlinkSync(finalPath); } catch (_) {}
    res.status(503).json({
      success: false,
      code: "LOCAL_OCR_UNAVAILABLE",
      message: "Prescription OCR is available only in the local hospital deployment.",
    });
    return false;
  }

  let result;
  try {
    result = await processDocument(finalPath);
  } catch (err) {

    try { fs.unlinkSync(finalPath); } catch (_) {}
    if (err.code === "LOCAL_OCR_UNAVAILABLE") {
      res.status(503).json({
        success: false,
        code: "LOCAL_OCR_UNAVAILABLE",
        message: "Prescription OCR is available only in the local hospital deployment.",
      });
      return false;
    }
    res.status(503).json({ error: `OCR failed: ${err.message}` });
    return false;
  }

  const doc = await Document.create({
    session_id:     sessionId,
    filename:       fname,
    raw_ocr_text:   result.raw_text,
    extracted_meds: result.medications,
    extracted_labs: result.labs,
  });

  res.json({
    document_id: doc.id,
    raw_text:    result.raw_text,
    medications: result.medications,
    labs:        result.labs,
  });
  return true;
}

module.exports = { multerMiddleware, handleDocumentUpload };
