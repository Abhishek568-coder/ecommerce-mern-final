import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { isLoggedIn } from "../cartStorage";
import "./checkout.css";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    note: "Pay in cash when your order arrives",
  },
  {
    id: "upi",
    label: "UPI",
    note: "Google Pay, PhonePe, Paytm & more",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    note: "Visa, Mastercard, RuPay, Amex",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    note: "All major Indian banks supported",
  },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // payment-specific fields
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [bank, setBank] = useState(BANKS[0]);

  // 🚪 Guard: checkout requires an account + prefill the known name/address
  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error("Please login to checkout.");
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || "",
        }));
      } catch {
        /* ignore bad JSON */
      }
    }

    const savedAddress = localStorage.getItem("shippingAddress");

    if (savedAddress) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(savedAddress) }));
      } catch {
        /* ignore bad JSON */
      }
    }
  }, [navigate]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await API.get("/api/cart");
      const items = (res.data.items || []).filter((item) => item.product);
      setCart({ ...res.data, items });
    } catch (err) {
      console.error("CHECKOUT CART ERROR:", err.response?.data || err);

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      toast.error(
        err.response?.data?.message || "Failed to load your bag"
      );
      setCart({ items: [] });
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const total = (cart?.items || []).reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  // 🔒 client-side validation before hitting the API
  const validate = () => {
    if (!form.fullName.trim()) return "Please enter the full name";
    if (!/^[0-9]{10}$/.test(form.phone.trim()))
      return "Please enter a valid 10-digit phone number";
    if (!form.addressLine.trim()) return "Please enter the address";
    if (!form.city.trim()) return "Please enter the city";
    if (!form.state.trim()) return "Please enter the state";
    if (!/^[0-9]{6}$/.test(form.pincode.trim()))
      return "Please enter a valid 6-digit pincode";

    if (paymentMethod === "upi" && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim()))
      return "Please enter a valid UPI ID";

    if (paymentMethod === "card") {
      if (!/^[0-9]{16}$/.test(card.number.replace(/\s/g, "")))
        return "Please enter a valid 16-digit card number";
      if (!card.name.trim()) return "Please enter the name on the card";
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(card.expiry.trim()))
        return "Please enter a valid expiry date (MM/YY)";
      if (!/^[0-9]{3}$/.test(card.cvv.trim()))
        return "Please enter a valid 3-digit CVV";
    }

    return null;
  };

  const placeOrder = async () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setPlacing(true);

      // 1️⃣ create the order with delivery details + payment method
      const res = await API.post("/api/orders", {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine: form.addressLine.trim(),
          landmark: form.landmark.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        paymentMethod,
      });

      const order = res.data;

      // 2️⃣ online payment → mark the order as paid (simulated)
      if (paymentMethod !== "cod") {
        await API.put(`/api/payment/${order._id}`);
        toast.success("Payment successful — order placed! ✅");
      } else {
        toast.success("Order placed successfully ✅");
      }

      // remember the address for the next order
      localStorage.setItem("shippingAddress", JSON.stringify(form));

      navigate("/orders");
    } catch (err) {
      console.error("PLACE ORDER ERROR:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Could not place the order ❌"
      );
    } finally {
      setPlacing(false);
    }
  };

  // ⏳ loading
  if (cart === null) {
    return (
      <div className="checkout-container">
        <div className="checkout-box">
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  // 🛒 nothing to check out
  if (cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-box">
          <div className="checkout-empty">
            <h3>Your bag is empty</h3>
            <p>Add a few products before checking out.</p>
            <button
              className="back-to-bag"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-box">

        {/* HEADER */}
        <div className="checkout-page-header">
          <h2 className="checkout-title">Checkout</h2>
          <span>{cart.items.length} items</span>
        </div>

        <div className="checkout-layout">

          {/* LEFT: delivery + payment */}
          <section className="checkout-main">

            {/* DELIVERY DETAILS */}
            <div className="checkout-section">
              <h3 className="section-title">Delivery Details</h3>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) =>
                      update("phone", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="addressLine">
                  Flat, House No., Building, Street *
                </label>
                <input
                  id="addressLine"
                  type="text"
                  placeholder="123, MG Road, Apartment 4B"
                  value={form.addressLine}
                  onChange={(e) => update("addressLine", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="landmark">Landmark (optional)</label>
                <input
                  id="landmark"
                  type="text"
                  placeholder="Near City Mall"
                  value={form.landmark}
                  onChange={(e) => update("landmark", e.target.value)}
                />
              </div>

              <div className="field-row three">
                <div className="field">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="400001"
                    value={form.pincode}
                    onChange={(e) =>
                      update("pincode", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="checkout-section">
              <h3 className="section-title">Payment Method</h3>

              <div className="payment-options">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option ${
                      paymentMethod === method.id ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />

                    <span className="payment-option-body">
                      <strong>{method.label}</strong>
                      <span className="payment-note">{method.note}</span>
                    </span>
                  </label>
                ))}
              </div>

              {/* UPI */}
              {paymentMethod === "upi" && (
                <div className="payment-fields">
                  <div className="field full">
                    <label htmlFor="upiId">UPI ID *</label>
                    <input
                      id="upiId"
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* CARD */}
              {paymentMethod === "card" && (
                <div className="payment-fields">
                  <div className="field full">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value })
                      }
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="cardName">Name on Card *</label>
                    <input
                      id="cardName"
                      type="text"
                      placeholder="JOHN DOE"
                      value={card.name}
                      onChange={(e) =>
                        setCard({ ...card, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="cardExpiry">Expiry (MM/YY) *</label>
                    <input
                      id="cardExpiry"
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({ ...card, expiry: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="cardCvv">CVV *</label>
                    <input
                      id="cardCvv"
                      type="password"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="123"
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          cvv: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {paymentMethod === "netbanking" && (
                <div className="payment-fields">
                  <div className="field full">
                    <label htmlFor="bank">Select Bank *</label>
                    <select
                      id="bank"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: order summary */}
          <aside className="checkout-summary">
            <h2 className="summary-heading">Order Summary</h2>

            <div className="summary-items">
              {cart.items.map((item) => (
                <div
                  className="summary-item"
                  key={item._id || item.product._id}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="summary-item-img"
                  />

                  <div className="summary-item-info">
                    <h4>{item.product.name}</h4>
                    <span>Qty: {item.quantity}</span>
                  </div>

                  <span className="summary-item-price">
                    ₹{(
                      Number(item.product.price) * item.quantity
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              className="place-order-btn"
              onClick={placeOrder}
              disabled={placing}
            >
              {placing
                ? "Processing..."
                : paymentMethod === "cod"
                ? "Place Order"
                : `Pay ₹${total.toLocaleString("en-IN")}`}
            </button>

            <button
              className="back-to-bag"
              onClick={() => navigate("/cart")}
              disabled={placing}
            >
              Back to Bag
            </button>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
