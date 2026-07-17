const Product = require("../models/Product");

// Create product
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
};

// Get all products
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};
exports.updateProduct = async (req, res) => {
  try {

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(product);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

exports.deleteProduct = async (req, res) => {
  try {

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Product deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};