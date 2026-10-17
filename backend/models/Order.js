const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },

    // 🔥 DELIVERY DETAILS (moved out of the cart into checkout)
    shippingAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      landmark: { type: String, trim: true, default: "" },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    // 🔥 PAYMENT
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking"],
      default: "cod",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);