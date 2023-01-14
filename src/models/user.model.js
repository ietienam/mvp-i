module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    deposit: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordChangedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  return User;
};
