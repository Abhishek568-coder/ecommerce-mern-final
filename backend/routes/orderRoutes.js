const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// Create order
router.post("/", authMiddleware, createOrder);

// Get orders
router.get("/", authMiddleware, getOrders);

// Admin update status
router.put("/:id", authMiddleware, updateOrderStatus);

module.exports = router;