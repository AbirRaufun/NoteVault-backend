const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createNote,
  listMyNotes,
  updateNote,
  deleteNote,
} = require("../controllers/notesController");

const router = express.Router();

// All note routes require authentication
router.use(protect);

router.post("/", createNote);
router.get("/", listMyNotes);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;