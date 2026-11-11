const Note = require("../models/Note");

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const note = await Note.create({
      title,
      body: body || "",
      owner: req.user.id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("createNote:", err);
    res.status(500).json({ message: "server error" });
  }
};

// GET /api/notes?page=1&limit=10
exports.listMyNotes = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { owner: req.user.id };

    const [items, total] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Note.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("listMyNotes:", err);
    res.status(500).json({ message: "server error" });
  }
};

// PATCH /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { title, body } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: "note not found" });
    res.json(note);
  } catch (err) {
    console.error("updateNote:", err);
    res.status(500).json({ message: "server error" });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "note not found" });
    res.json({ message: "deleted", id: deleted._id });
  } catch (err) {
    console.error("deleteNote:", err);
    res.status(500).json({ message: "server error" });
  }
};