const Order = require("../models/Order");

// 🔥 PAY ORDER (SIMULATION)
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // simulate payment success
    order.isPaid = true;
    order.paymentStatus = "paid";

    await order.save();

    res.json({
      message: "Payment successful",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};