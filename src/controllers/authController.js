const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { loginSchema } = require("../utils/validateRequest");

const db = require("../models");
const User = db.user;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const login = async (req, res) => {
  try {
    const validatedInput = await loginSchema
      .validateAsync(
        {
          username: req.body.username,
          password: req.body.password,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const user = await User.findOne({ where: { username: validatedInput.username } });

    if (!user || !(await bcrypt.compare(validatedInput.password, user.password))) {
      return res.status(401).json("Incorrect username or password");
    }

    const token = signToken(user.id);
    
    return res.status(200).json(token);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

module.exports = {
  login,
};
