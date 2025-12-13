const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }
});

module.exports = mongoose.model("Document", DocumentSchema);
