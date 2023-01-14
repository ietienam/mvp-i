const Joi = require("joi");

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(7).required(),
  role: Joi.string().required(),
  deposit: Joi.number(),
});

const depositCoinSchema = Joi.object({
  deposit: Joi.number().min(5).max(100).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(7).required(),
});

const passwordChangeSchema = Joi.object({
  oldPassword: Joi.string().min(7).required(),
  newPassword: Joi.string().min(7).required(),
});

const createProductSchema = Joi.object({
  amountAvailable: Joi.number().multiple(5).required(),
  cost: Joi.number().required(),
  productName: Joi.string().min(2).required(),
});

const updateProductSchema = Joi.object({
  amountAvailable: Joi.number().multiple(5),
  cost: Joi.number(),
});

const buyProductSchema = Joi.object({
  amountOfProducts: Joi.number().min(1).required(),
});

module.exports = {
  createUserSchema,
  depositCoinSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  passwordChangeSchema,
  buyProductSchema,
};
