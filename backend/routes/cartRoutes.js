const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// ADD TO CART
router.post("/", authMiddleware, addToCart);

// GET CART
router.get("/", authMiddleware, getCart);

// ✅ FIXED → use POST instead of DELETE
router.post("/remove", authMiddleware, removeFromCart);

// ✅ FIXED → use POST instead of PUT
router.post("/update", authMiddleware, updateQuantity);

module.exports = router;