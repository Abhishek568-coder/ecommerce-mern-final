const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");

  res.json(users);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product");

  res.json(orders);
};

exports.getStats = async (req, res) => {

  const users = await User.countDocuments();
  const products = await Product.countDocuments();
  const orders = await Order.countDocuments();

  const revenueData =
    await Order.find();

  const revenue =
    revenueData.reduce(
      (acc, order) =>
        acc + order.totalPrice,
      0
    );

  res.json({
    users,
    products,
    orders,
    revenue,
  });
};