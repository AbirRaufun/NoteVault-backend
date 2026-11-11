const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: "", trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Aggregation 2 starts with $match { author: ObjectId(id) } — this index
// makes that filter use an index scan instead of a collection scan.
postSchema.index({ author: 1 });

module.exports = mongoose.model("Post", postSchema);