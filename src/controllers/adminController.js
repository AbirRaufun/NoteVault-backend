const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Note = require("../models/Note");

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// GET /api/admin/users?page=1&limit=10
exports.listUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      User.find({})
        .select("-password")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({}),
    ]);
    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
  } catch (err) {
    console.error("listUsers:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserById:", err);
    res.status(500).json({ message: "server error" });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      role: role === "admin" ? "admin" : "user",
      interests: Array.isArray(interests) ? interests : [],
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests,
    });
  } catch (err) {
    console.error("createUser:", err);
    res.status(500).json({ message: "server error" });
  }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, interests } = req.body;

    if (id === req.user.id && role !== undefined && role !== req.user.role) {
      return res.status(400).json({ message: "you cannot change your own role" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role === "admin" ? "admin" : "user";
    if (interests !== undefined) updates.interests = Array.isArray(interests) ? interests : [];

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    console.error("updateUser:", err);
    res.status(500).json({ message: "server error" });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "you cannot delete your own account" });
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "user not found" });

    await Note.deleteMany({ owner: deleted._id });

    res.json({ message: "deleted", id: deleted._id });
  } catch (err) {
    console.error("deleteUser:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/admin/notes?page=1&limit=10
exports.listAllNotes = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      Note.find({})
        .sort({ createdAt: -1 })
        .populate("owner", "name email")
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments({}),
    ]);
    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
  } catch (err) {
    console.error("listAllNotes:", err);
    res.status(500).json({ message: "server error" });
  }
};