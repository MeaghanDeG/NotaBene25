const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: "General" },
  createdAt: { type: Date, default: Date.now },
  calendarDate: { type: Date, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
});

module.exports = mongoose.model("Note", noteSchema);
