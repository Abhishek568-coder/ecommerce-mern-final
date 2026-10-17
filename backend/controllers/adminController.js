const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// allowed order statuses (must match the Order model)
const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"];

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");

  res.json(users);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json(orders);
};

exports.getStats = async (req, res) => {

  const users = await User.countDocuments();
  const products = await Product.countDocuments();
  const orders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({
    status: "pending",
  });

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
    pendingOrders,
    revenue,
  });
};

// 🔄 UPDATE ORDER STATUS (ADMIN)
// Accepts { status } and optionally { isPaid } to settle COD orders.
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, isPaid } = req.body;

    const update = {};

    if (status !== undefined) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
        });
      }

      update.status = status;
    }

    if (typeof isPaid === "boolean") {
      update.isPaid = isPaid;
      update.paymentStatus = isPaid ? "paid" : "pending";
    }

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "Nothing to update (send status and/or isPaid)" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.log("❌ UPDATE ORDER STATUS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
