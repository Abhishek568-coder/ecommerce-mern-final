const Order = require("../models/Order");

// 🔥 PAY ORDER (SIMULATION)
// Called right after an order is created with an online payment method.
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 only the owner can pay for their own order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isPaid) {
      return res.json({ message: "Order already paid", order });
    }

    // 🔥 Cash on Delivery is collected later, not here
    if (order.paymentMethod === "cod") {
      return res
        .status(400)
        .json({ message: "COD orders cannot be paid online" });
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
