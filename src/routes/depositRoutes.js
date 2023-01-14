const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { depositCoin } = require("../controllers/userController");

router.use(protect, restrictTo("buyer"));

router.route("").patch(depositCoin);

module.exports = router;
