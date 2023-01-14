const db = require("../models");
const Product = db.product;

const {
  createProductSchema,
  updateProductSchema,
} = require("../utils/validateRequest");

const addProduct = async (req, res) => {
  try {
    const validatedInput = await createProductSchema
      .validateAsync(
        {
          amountAvailable: req.body.amountAvailable,
          cost: req.body.cost,
          productName: req.body.productName,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });
    validatedInput.sellerId = req.user.id;

    const product = await Product.findOne({
      where: { productName: validatedInput.productName },
    });

    if (product) {
      return res
        .status(400)
        .json("Product already exists. Please update product instead");
    }

    const newProduct = await Product.create(validatedInput);

    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const validatedInput = await updateProductSchema
      .validateAsync(
        {
          amountAvailable: req.body.amountAvailable,
          cost: req.body.cost,
        },
        { stripUnknown: true }
      )
      .catch((err) => {
        return res.status(400).json(err.details[0].message);
      });

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(400).json("Product does not exist!");
    }

    if (product.sellerId !== req.user.id) {
      return res
        .status(401)
        .json("Permission denied! Only seller can update this product.");
    }

    if (validatedInput.amountAvailable) {
        validatedInput.amountAvailable += parseInt(product.amountAvailable);
    }

    await Product.update(validatedInput, {
      where: { id: product.id },
    });

    const updatedProduct = await Product.findByPk(product.id);

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(400).json("Product does not exist!");
    }

    if (product.sellerId !== req.user.id) {
      return res
        .status(401)
        .json("Permission denied! Only seller can delete this product.");
    }

    await Product.destroy({ where: { id: product.id } });

    return res.status(204).json("Product deleted");
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(400).json("Product does not exist!");
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      cause: error,
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
};
