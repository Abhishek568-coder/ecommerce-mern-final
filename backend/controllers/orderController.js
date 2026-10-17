const Order = require("../models/Order");
const Cart = require("../models/Cart");

// 🔒 required delivery fields
const REQUIRED_ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "addressLine",
  "city",
  "state",
  "pincode",
];

const PAYMENT_METHODS = ["cod", "upi", "card", "netbanking"];

// allowed order statuses (must match the Order model)
const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"];

// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod" } = req.body;

    // 🔥 NOTE: delivery details are now collected on the checkout screen
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res
        .status(400)
        .json({ message: "Delivery details are required" });
    }

    // validate address
    const missing = REQUIRED_ADDRESS_FIELDS.filter(
      (field) => !String(shippingAddress[field] || "").trim()
    );

    if (missing.length) {
      return res.status(400).json({
        message: `Missing delivery details: ${missing.join(", ")}`,
      });
    }

    if (!/^[0-9]{10}$/.test(String(shippingAddress.phone).trim())) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    if (!/^[0-9]{6}$/.test(String(shippingAddress.pincode).trim())) {
      return res
        .status(400)
        .json({ message: "Pincode must be 6 digits" });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

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
      shippingAddress: {
        fullName: String(shippingAddress.fullName).trim(),
        phone: String(shippingAddress.phone).trim(),
        addressLine: String(shippingAddress.addressLine).trim(),
        landmark: String(shippingAddress.landmark || "").trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },
      paymentMethod,
      // COD stays unpaid until delivery; online methods are marked
      // paid by PUT /api/payment/:id
      isPaid: false,
      paymentStatus: "pending",
    });

    // 🔥 CLEAR CART
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
// NOTE: the admin dashboard uses PUT /api/admin/orders/:id instead.
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

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    order.status = status;
    await order.save();

    res.json(order);

  } catch (error) {
    console.log("❌ UPDATE ORDER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};