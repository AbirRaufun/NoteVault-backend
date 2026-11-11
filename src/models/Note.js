const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: "", trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// "list my notes, newest first" — the most common query in the app.
// Compound index lets Mongo find just this owner's notes, already sorted by
// createdAt DESC, without an in-memory sort. Field order matters: owner (equality
// filter) first, createdAt (sort) second. Reversing breaks the optimization.
noteSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);