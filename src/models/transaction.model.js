module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    productName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amountOfProducts: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    buyerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sellerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return Transaction;
};
