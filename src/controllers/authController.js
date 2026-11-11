const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      interests: Array.isArray(interests) ? interests : [],
    });

    res.status(201).json({
      message: "registered",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "server error" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (err) {
    console.error("me:", err);
    res.status(500).json({ message: "server error" });
  }
};