const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const post = await Post.create({
      title,
      body: body || "",
      author: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("createPost:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/posts/by-user/:id
// Aggregation 2: filter posts by author, then $lookup to attach author details.
// The pipeline MUST contain a $lookup stage (task requirement).
exports.postsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid user id" });
    }

    const results = await Post.aggregate([
      // 1. Only this author's posts. Uses the { author: 1 } index.
      { $match: { author: new mongoose.Types.ObjectId(id) } },

      // 2. Join to users collection on author = _id.
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },

      // 3. Flatten authorInfo array (of 1) into a single object.
      { $unwind: "$authorInfo" },

      // 4. Shape the response — hide internal fields.
      {
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          createdAt: 1,
          author: {
            _id: "$authorInfo._id",
            name: "$authorInfo.name",
            email: "$authorInfo.email",
          },
        },
      },

      // 5. Newest first.
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ userId: id, total: results.length, posts: results });
  } catch (err) {
    console.error("postsByUser:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/insights/by-interest
// Aggregation 1: group users by interest. EXACTLY ONE aggregate() call,
// no .find() first, no JS grouping. The whole thing is one pipeline.
exports.byInterest = async (req, res) => {
  try {
    const results = await User.aggregate([
      // 1. Explode interests array: one user → one doc per interest.
      { $unwind: "$interests" },

      // 2. Group by interest value, collecting users into an array.
      {
        $group: {
          _id: "$interests",
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              role: "$role",
            },
          },
          count: { $sum: 1 },
        },
      },

      // 3. Alphabetical by interest name — deterministic output.
      { $sort: { _id: 1 } },

      // 4. Rename _id → interest for a cleaner API response.
      {
        $project: {
          _id: 0,
          interest: "$_id",
          count: 1,
          users: 1,
        },
      },
    ]);

    res.json({ totalInterests: results.length, groups: results });
  } catch (err) {
    console.error("byInterest:", err);
    res.status(500).json({ message: "server error" });
  }
};