const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

// Protected route
router.post("/", authMiddleware, createProduct);

// Public route
router.get("/", getProducts);

module.exports = router;