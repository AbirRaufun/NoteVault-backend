const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
  listUsers, createUser, updateUser, deleteUser, listAllNotes,
} = require("../controllers/adminController");

const router = express.Router();

// EVERY route in this router requires auth AND admin role.
// Order matters: protect first (proves identity), then adminOnly (checks role).
router.use(protect, adminOnly);

router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/notes", listAllNotes);

module.exports = router;