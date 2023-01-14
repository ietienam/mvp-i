module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("product", {
    amountAvailable: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    cost: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    productName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    sellerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return Product;
};
