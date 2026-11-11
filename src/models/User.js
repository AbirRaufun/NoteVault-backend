const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Login looks up users by email — index makes it O(log n) instead of O(n).
userSchema.index({ email: 1 }, { unique: true });

// Admin "list all users" sorts by createdAt — this serves that query.
userSchema.index({ createdAt: 1 });

// The by-interest aggregation $unwinds on interests — uses this index.
userSchema.index({ interests: 1 });

module.exports = mongoose.model("User", userSchema);