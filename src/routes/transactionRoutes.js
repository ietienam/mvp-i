const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { buyProduct } = require("../controllers/transactionController");

router.use(protect, restrictTo("buyer"));

router.route("/:id").post(buyProduct);

module.exports = router;
