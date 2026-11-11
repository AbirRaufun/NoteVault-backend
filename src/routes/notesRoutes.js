const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createNote,
  listMyNotes,
  updateNote,
  deleteNote,
  getNoteById,
} = require("../controllers/notesController");

const router = express.Router();

router.use(protect);

router.post("/", createNote);
router.get("/", listMyNotes);
router.get("/:id", getNoteById);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;