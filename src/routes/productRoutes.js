const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
} = require("../controllers/productController");

router.use(protect);

router.route("").get(getAllProducts);
router.route("/:id").get(getProduct);

router.use(restrictTo("seller"));

router.route("").post(addProduct);
router.route("/:id").patch(updateProduct);
router.route("/:id").delete(deleteProduct);

module.exports = router;
