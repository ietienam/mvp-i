const db = require("../models");
const User = db.user;

const bcrypt = require("bcryptjs");

const {
  createUserSchema,
  depositCoinSchema,
  passwordChangeSchema,
} = require("../utils/validateRequest");
const { hashPassword } = require("../utils/hashPassword");

const createUser = async (req, res) => {
  try {
    const validatedInput = await createUserSchema
      .validateAsync(
        {
          username: req.body.username,
          password: req.body.password,
          role: req.body.role,
          deposit: req.body.deposit,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const user = await User.findOne({
      where: { username: validatedInput.username },
    });

    if (user) {
      return res.status(400).json("User already exists!");
    }

    validatedInput.password = await hashPassword(req.body.password);

    const newUser = await User.create(validatedInput);

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const depositCoin = async (req, res) => {
  try {
    const validatedInput = await depositCoinSchema
      .validateAsync(
        {
          deposit: req.body.deposit,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const result = await db.sequelize.transaction(async (t) => {
      const coins = [5, 10, 20, 50, 100];

      if (coins.indexOf(validatedInput.deposit) === -1) {
        return {
          statusCode: 400,
          data: "Invalid coin deposited! Please enter a valid coin deposit",
        };
      }

      validatedInput.deposit =
        validatedInput.deposit + parseInt(req.user.deposit, 10);

      await User.update(
        { deposit: validatedInput.deposit },
        {
          where: { id: req.user.id },
        }
      );

      const updatedUser = await User.findByPk(req.user.id);

      return { statusCode: 200, data: updatedUser };
    });

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const resetDeposit = async (req, res) => {
  try {
    await User.update(
      { deposit: 0 },
      {
        where: { id: req.user.id },
      }
    );

    const updatedUser = await User.findByPk(req.user.id);

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(400).json("User does not exist!");
    }

    if (user.id !== req.user.id) {
      return res
        .status(401)
        .json("Permission denied! You can only delete your own profile.");
    }

    await User.destroy({ where: { id: req.user.id } });

    return res.status(201).json("User deleted");
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const validatedInput = await passwordChangeSchema
      .validateAsync(
        {
          oldPassword: req.body.oldPassword,
          newPassword: req.body.newPassword,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const isPasswordCorrect = await bcrypt.compare(
      validatedInput.oldPassword,
      req.user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Incorrect old password");
    }

    const newPassword = await hashPassword(validatedInput.newPassword);

    if (newPassword === req.user.password) {
      return res
        .status(400)
        .json("New password must be different from old password");
    }

    await User.update(
      { password: newPassword, passwordChangedAt: new Date().toISOString() },
      {
        where: { id: req.user.id },
      }
    );

    const updatedUser = await User.findByPk(req.user.id);

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

module.exports = {
  createUser,
  depositCoin,
  resetDeposit,
  deleteUser,
  changeUserPassword,
};
