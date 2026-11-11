const express = require("express");
const { protect } = require("../middleware/auth");
const { createPost, postsByUser } = require("../controllers/postsController");

const router = express.Router();

router.use(protect);

router.post("/", createPost);
router.get("/by-user/:id", postsByUser);

module.exports = router;