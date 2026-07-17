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

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getStats
);

module.exports = router;