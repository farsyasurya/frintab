const express = require("express");
const cors = require("cors");

const authRoutes = require("./router/auth");
const transactionRoutes = require("./router/transaction");
const groupRoutes = require("./router/grup");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/group", groupRoutes);

app.use("/api/transaction", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Couple Savings API Running 🚀");
});

module.exports = app;