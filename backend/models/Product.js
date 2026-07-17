const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: {
    type: String,
    required: true,
    enum: [
      "All",
      "Swimming",
      "Activewear",
      "Gym",
      "Cycling",
      "Hiking",
      "Shoes",
      "Bags"
    ]
  }
});

module.exports = mongoose.model("Product", productSchema);