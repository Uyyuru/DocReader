const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  question: String,
  answer: String,
  references: Array,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
