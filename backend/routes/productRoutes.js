const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public
router.get("/", getProducts);

// Admin only
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

// Admin only
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);
module.exports = router;