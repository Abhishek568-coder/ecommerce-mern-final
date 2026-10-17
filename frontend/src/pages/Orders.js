import { useEffect, useState } from "react";
import API from "../api";
import LoginPrompt from "../components/LoginPrompt";
import { isLoggedIn } from "../cartStorage";
import "./orders.css";

// 💰 pretty currency
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

// 📅 readable date
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// 💳 payment method labels
const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

function Orders() {
  const loggedIn = isLoggedIn();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(loggedIn);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(!loggedIn);
  const [loginMessage, setLoginMessage] = useState(
    "Please login to view your orders."
  );

  useEffect(() => {
    // 🙅 guests never hit the protected endpoint — show the prompt instead
    if (!isLoggedIn()) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/api/orders");

      setOrders(res.data || []);
    } catch (err) {
      console.log("❌ FETCH ORDERS ERROR:", err.response?.data || err);

      // 🔐 expired / invalid session → offer a fresh login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setNeedsLogin(true);
        setLoginMessage("Your session has expired. Please login again to view your orders.");
        return;
      }

      setError(
        err.response?.data?.message || "Could not load your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // line total for a single item (unit price × qty)
  const lineTotal = (item) =>
    (item.product?.price || 0) * (item.quantity || 0);

  // order total — trust the stored value, fall back to summing items
  const orderTotal = (order) =>
    order.totalPrice ??
    order.total ??
    (order.items || []).reduce((acc, item) => acc + lineTotal(item), 0);

  const itemCount = (order) =>
    (order.items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  if (needsLogin) {
    return (
      <div className="orders-container">
        <h2 className="orders-title">Your Orders</h2>

        <LoginPrompt
          title="Login to see your orders"
          message={loginMessage}
          hint="Your order history is linked to your account."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-container">
        <h2 className="orders-title">Your Orders</h2>
        <p className="orders-message">Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <h2 className="orders-title">Your Orders</h2>
        <p className="orders-message orders-message-error">{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="orders-container">
        <h2 className="orders-title">Your Orders</h2>
        <p className="orders-message">No orders found</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Your Orders</h2>

      <div className="orders-list">
        {orders.map((order) => {
          const paid = order.isPaid || order.paymentStatus === "paid";
          const method =
            PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—";
          const count = itemCount(order);

          return (
            <article className="order-card" key={order._id}>
              <header className="order-header">
                <div className="order-heading">
                  <span className="order-id">
                    Order #{order._id?.slice(-6).toUpperCase()}
                  </span>
                  {order.createdAt && (
                    <span className="order-date">
                      {formatDate(order.createdAt)}
                    </span>
                  )}
                </div>

                <span className={`status ${order.status}`}>
                  {order.status}
                </span>
              </header>

              <div className="order-items">
                {order.items?.map((item) => (
                  <div
                    className="order-item"
                    key={item.product?._id || item._id}
                  >
                    <div className="order-item-media">
                      {item.product?.image ? (
                        <img
                          className="order-img"
                          src={item.product.image}
                          alt={item.product?.name || "Product"}
                        />
                      ) : (
                        <div className="order-img order-img-empty" />
                      )}
                    </div>

                    <div className="order-item-info">
                      <h4>{item.product?.name || "Product unavailable"}</h4>
                      <p className="order-item-price">
                        {money(item.product?.price)}{" "}
                        <span className="order-item-qty">
                          × {item.quantity}
                        </span>
                      </p>
                    </div>

                    <div className="order-item-total">
                      {money(lineTotal(item))}
                    </div>
                  </div>
                ))}
              </div>

              <footer className="order-footer">
                <div className="order-meta">
                  <span className="order-meta-label">Items</span>
                  <span className="order-meta-value">{count}</span>
                </div>

                <div className="order-meta">
                  <span className="order-meta-label">Payment</span>
                  <span className="order-meta-value">
                    {method}
                    <span
                      className={`pay-state ${paid ? "paid" : "unpaid"}`}
                    >
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                  </span>
                </div>

                <div className="order-total">
                  <span className="order-meta-label">Total</span>
                  <span className="order-total-value">
                    {money(orderTotal(order))}
                  </span>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;
