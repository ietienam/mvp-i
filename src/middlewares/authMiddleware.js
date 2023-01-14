const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

const checkIfPasswordWasChanged = function (passwordChangeTime, JWTTimestamp) {
  if (passwordChangeTime) {
    const changedTimestamp = parseInt(passwordChangeTime.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new Error("Access denied! Please login", 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return next(new Error("The user for this token no longer exists!", 401));
    }

    const isPasswordChanged = checkIfPasswordWasChanged(
      currentUser.passwordChangedAt,
      decoded.iat
    );

    if (isPasswordChanged) {
      return next(
        new Error("User recently changed password! Please log in again.", 401)
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You do not have permission to perform this action!", 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
