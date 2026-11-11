const express = require("express");
const { protect } = require("../middleware/auth");
const { byInterest } = require("../controllers/postsController");

const router = express.Router();

router.use(protect);

router.get("/by-interest", byInterest);

module.exports = router;