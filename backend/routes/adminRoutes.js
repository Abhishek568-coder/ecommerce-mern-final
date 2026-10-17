const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const {
  getUsers,
  getOrders,
  getStats,
  updateOrderStatus,
} = require("../controllers/adminController");

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getUsers
);

router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  getOrders
);

// 🔄 update an order's status / payment state
router.put(
  "/orders/:id",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getStats
);

module.exports = router;