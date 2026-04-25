const Cart = require("../models/Cart");

// ✅ Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;

        // 🔥 remove if qty <= 0
        if (existingItem.quantity <= 0) {
          cart.items = cart.items.filter(
            (item) =>
              item.product.toString() !== productId.toString()
          );
        }
      } else {
        // 🔥 add new item
        if (quantity > 0) {
          cart.items.push({ product: productId, quantity });
        }
      }

      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Remove item
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId.toString()
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔄 Update quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId.toString()
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease") {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          (i) =>
            i.product.toString() !== productId.toString()
        );
      }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};