const express = require("express");
const router = express.Router();

const { payOrder } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Pay order
router.put("/:id", authMiddleware, payOrder);

module.exports = router;