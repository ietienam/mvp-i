const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { resetDeposit } = require("../controllers/userController");

router.use(protect, restrictTo("buyer"));

router.route("").patch(resetDeposit);

module.exports = router;
