const express = require("express");
const pdfParse = require("pdf-parse");
const multer = require("multer");
const Document = require("../models/Document");
const auth = require("../middleware/auth");
const getEmbedding = require("../services/embeddingService");
const chunkText = require("../services/chunkService");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text || "";
    }

    // ----------------------- TEXT FILES ---------------------
    else if (
      req.file.mimetype.includes("text") ||
      /\.(txt|md|html)$/i.test(req.file.originalname)
    ) {
      extractedText = req.file.buffer.toString("utf8");
    }

    // ----------------------- INVALID FILE -------------------
    else {
      return res.status(400).json({
        error: "Only PDF, TXT, MD, and HTML files are supported."
      });
    }

    // If we could NOT extract text
    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        error: "Could not extract readable text from the uploaded file."
      });
    }

    const chunks = chunkText(extractedText);
    const docsToInsert = [];

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);

      docsToInsert.push({
        userId: req.user._id,
        filename: req.file.originalname,
        content: chunk,
        embedding
      });
    }

    await Document.insertMany(docsToInsert);

    res.json({
      success: true,
      message: "Document uploaded and processed successfully.",
      filename: req.file.originalname,
      chunks: chunks.length
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const files = await Document.distinct("filename", { userId: req.user._id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
