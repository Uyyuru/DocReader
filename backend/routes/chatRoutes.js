const express = require("express");
const mongoose = require("mongoose");
const Document = require("../models/Document");
const getEmbedding = require("../services/embeddingService");
const generateAnswer = require("../services/aiService");
const ChatHistory = require("../models/ChatHistory");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1️⃣ Get query embedding
    const queryVector = await getEmbedding(query);

    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 2️⃣ Vector search (MongoDB Atlas)
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 150,
          limit: 20
        }
      },
      {
        $match: {
          userId: userId  
        }
      },
      {
        $limit: 5
      },
      {
        $project: {
          content: 1,
          filename: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    // 3️⃣ If no relevant chunks found
    if (results.length === 0) {
      await ChatHistory.create({
        userId: req.user._id,
        question: query,
        answer: "No relevant information found in your uploaded documents.",
        references: []
      });

      return res.json({
        answer: "No relevant information found in your uploaded documents.",
        references: []
      });
    }

    // 4️⃣ Build context for AI
    const context = results
      .map(r => `File: ${r.filename}\nContent: ${r.content}`)
      .join("\n\n");

    const prompt = `
      Use ONLY the following context from the user's uploaded documents:
      ${context}

      QUESTION: ${query}

      Respond using only the documents above.
      If the answer is not found, say:
      "I cannot find that information in your documents."
    `;

    // 5️⃣ Generate AI answer
    const answer = await generateAnswer(prompt);

    // 6️⃣ Save history
    await ChatHistory.create({
      userId: req.user._id,
      question: query,
      answer,
      references: results
    });

    // 7️⃣ Final response
    res.json({
      success: true,
      answer,
      references: results
    });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
