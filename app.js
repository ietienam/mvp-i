const express = require("express");
const xss = require("xss-clean");
const cors = require("cors");

const productRoutes = require("./src/routes/productRoutes");
const authRoutes = require("./src/routes/authRoutes");
const depositRoutes = require("./src/routes/depositRoutes");
const resetDepositRoutes = require("./src/routes/resetDepositRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

const db = require("./src/models");

db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Data sanitization against XSS
app.use(xss());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/reset", resetDepositRoutes);
app.use("/api/buy", transactionRoutes);
app.use("/api/users", userRoutes);

app.all("*", (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server`));
});

app.use((err, req, res, next) => {
  res.json(err);
});

module.exports = app;
