const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ✅ CREATE ORDER (FINAL FIX)
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    // ❌ empty cart
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔥 FIX: remove broken products
    const validItems = cart.items.filter(item => item.product);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    let totalPrice = 0;

    const cleanItems = validItems.map((item) => {
      totalPrice += item.product.price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
      };
    });

    // ✅ CREATE ORDER
    const order = await Order.create({
      user: req.user.id,
      items: cleanItems,
      totalPrice,
      status: "pending",
    });

    // 🔥 ALSO CLEAN CART (remove broken ones permanently)
    cart.items = validItems;
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    console.log("❌ ORDER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET USER ORDERS
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.log("❌ GET ORDERS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE ORDER STATUS (ADMIN ONLY)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    order.status = status;
    await order.save();

    res.json(order);

  } catch (error) {
    console.log("❌ UPDATE ORDER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};