const express = require("express");
const router = express.Router();
const auth = require("../midleware/auth");
const {
  createTransaction,
  getGroupTransactions,
} = require("../controllers/transaction");

router.post("/", auth, createTransaction);
router.get("/:groupId", auth, getGroupTransactions);

module.exports = router;