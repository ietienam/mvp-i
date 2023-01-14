const db = require("../models");
const Transaction = db.transaction;
const Product = db.product;
const User = db.user;

const { buyProductSchema } = require("../utils/validateRequest");

const buyProduct = async (req, res) => {
  try {
    const validatedInput = await buyProductSchema
      .validateAsync(
        {
          amountOfProducts: req.body.amountOfProducts,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const result = await db.sequelize.transaction(async (t) => {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return { statusCode: 400, data: "Product does not exist" };
      }

      if (
        req.user.deposit === null ||
        parseInt(req.user.deposit, 10) < parseInt(product.cost, 10)
      ) {
        return { statusCode: 400, data: "Insufficient balance" };
      }

      if (
        validatedInput.amountOfProducts > parseInt(product.amountAvailable, 10)
      ) {
        return { statusCode: 400, data: "Not enough product in stock" };
      }

      if (
        parseInt(req.user.deposit, 10) -
          parseInt(validatedInput.amountOfProducts, 10) *
            parseInt(product.cost, 10) <
        0
      ) {
        return { statusCode: 400, data: "Insufficient balance" };
      }

      await User.update(
        {
          deposit:
            parseInt(req.user.deposit, 10) -
            parseInt(validatedInput.amountOfProducts, 10) *
              parseInt(product.cost, 10),
        },
        { where: { id: req.user.id } }
      );

      await Product.update(
        {
          amountAvailable:
            parseInt(product.amountAvailable) - validatedInput.amountOfProducts,
        },
        { where: { id: product.id } }
      );

      await Transaction.create({
        productId: req.params.id,
        sellerId: product.sellerId,
        buyerId: req.user.id,
        amountOfProducts: validatedInput.amountOfProducts,
        productName: product.productName,
      });

      const updatedUser = await User.findByPk(req.user.id);

      return {
        statusCode: 200,
        data: {
          totalSpent: product.cost * validatedInput.amountOfProducts,
          change: calculateChange(parseInt(updatedUser.deposit, 10)),
          product: {
            id: product.id,
            amountAvailable:
              parseInt(product.amountAvailable) -
              validatedInput.amountOfProducts,
            cost: product.cost,
            productName: product.productName,
            sellerId: product.sellerId,
          },
        },
      };
    });

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const calculateChange = (balance) => {
  let change = balance;
  let result = [];
  const denomination = [5, 10, 20, 50, 100];
  for (let i = denomination.length - 1; i >= 0; i--) {
    while (change >= denomination[i]) {
      change -= denomination[i];
      result.push(denomination[i]);
    }
  }
  return result;
};

module.exports = {
  buyProduct,
};
