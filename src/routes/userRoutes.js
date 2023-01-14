const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createUser,
  changeUserPassword,
  deleteUser,
} = require("../controllers/userController");

router.route("").post(createUser);

router.use(protect);

router.route("").patch(changeUserPassword);
router.route("").delete(deleteUser);

module.exports = router;
