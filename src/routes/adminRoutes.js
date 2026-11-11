const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listAllNotes,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/notes", listAllNotes);

module.exports = router;