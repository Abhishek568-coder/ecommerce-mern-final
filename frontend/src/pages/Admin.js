import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserRound,
  Package,
  ReceiptText,
  Hourglass,
  Wallet,
  Lock,
  CreditCard,
  MapPin,
} from "lucide-react";
import API from "../api";
import LoginPrompt from "../components/LoginPrompt";
import { isLoggedIn } from "../cartStorage";
import "./admin.css";

const CARDS = [
  { key: "users", label: "Users", icon: UserRound, accent: "#2563eb" },
  { key: "products", label: "Products", icon: Package, accent: "#7c3aed" },
  { key: "orders", label: "Orders", icon: ReceiptText, accent: "#0891b2" },
  { key: "pendingOrders", label: "Pending", icon: Hourglass, accent: "#d97706" },
  { key: "revenue", label: "Revenue", icon: Wallet, accent: "#16a34a", money: true },
];

const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"];

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function Admin() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn());
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(!isLoggedIn());
  const [loginMessage, setLoginMessage] = useState(
    "Please login with an admin account to open the dashboard."
  );
  const [savingId, setSavingId] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, ordersRes] = await Promise.all([
        API.get("/api/admin/stats"),
        API.get("/api/admin/orders"),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      console.error("❌ ADMIN DASHBOARD ERROR:", message || err);

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setNeedsLogin(true);
        setLoginMessage("Please login with an admin account to open the dashboard.");
        return;
      }

      if (status === 403) {
        setError(
          "You don't have admin access. An admin needs to promote your account."
        );
        return;
      }

      setError(message || "Could not load the dashboard.");
      toast.error(message || "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 🙅 don't hit admin endpoints without a session
    if (!isLoggedIn()) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [fetchDashboard]);

  // 🔄 update a single order (status and/or paid state)
  const updateOrder = async (order, changes) => {
    try {
      setSavingId(order._id);

      const res = await API.put(`/api/admin/orders/${order._id}`, changes);

      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.data : o))
      );

      // keep the pending counter fresh
      if (changes.status) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                pendingOrders: orders.filter((o) =>
                  o._id === order._id
                    ? changes.status === "pending"
                    : o.status === "pending"
                ).length,
              }
            : prev
        );
      }

      toast.success(
        changes.isPaid === undefined
          ? `Order marked as ${changes.status}`
          : changes.isPaid
          ? "Order marked as paid"
          : "Order marked as unpaid"
      );
    } catch (err) {
      console.error("❌ UPDATE ORDER ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Could not update the order");
    } finally {
      setSavingId(null);
    }
  };

  // 🔐 no session → prompt for admin login
  if (needsLogin) {
    return (
      <div className="admin-container">
        <h1 className="admin-heading">Admin Dashboard</h1>

        <LoginPrompt
          title="Admin login required"
          message={loginMessage}
          hint="Only accounts with admin access can open this page."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <h1 className="admin-heading">Admin Dashboard</h1>
        <p className="admin-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h1 className="admin-heading">Admin Dashboard</h1>

        <div className="admin-error">
          <span className="admin-error-icon">
            <Lock size={28} />
          </span>
          <p>{error}</p>

          <button className="admin-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-heading">Admin Dashboard</h1>

      {/* STATS */}
      <div className="admin-cards">
        {CARDS.map((card) => {
          const value = stats?.[card.key] ?? 0;
          const Icon = card.icon;

          return (
            <div
              className="admin-card"
              key={card.key}
              style={{ borderTopColor: card.accent }}
            >
              <span
                className="admin-card-icon"
                style={{ color: card.accent }}
              >
                <Icon size={22} />
              </span>

              <span className="admin-card-label">{card.label}</span>

              <span className="admin-card-value">
                {card.money
                  ? `₹${Number(value).toLocaleString("en-IN")}`
                  : Number(value).toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* ORDERS */}
      <div className="admin-orders">
        <h2 className="admin-subheading">
          Orders {orders.length > 0 && <span>({orders.length})</span>}
        </h2>

        {orders.length === 0 ? (
          <p className="admin-muted">No orders yet.</p>
        ) : (
          <div className="admin-order-list">
            {orders.map((order) => {
              const itemsTotal = (order.items || []).reduce(
                (acc, item) => acc + (item.quantity || 0),
                0
              );

              const address = order.shippingAddress || {};
              const saving = savingId === order._id;

              return (
                <div className="admin-order" key={order._id}>

                  {/* HEADER ROW */}
                  <div className="admin-order-head">
                    <div>
                      <span className="admin-order-id">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>

                      <span className="admin-order-date">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <span className="admin-order-total">
                      ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* META */}
                  <div className="admin-order-meta">
                    <span>
                      <UserRound size={14} />
                      {order.user?.name || "Unknown"}
                      {order.user?.email ? ` (${order.user.email})` : ""}
                    </span>

                    <span>
                      <Package size={14} />
                      {itemsTotal} item(s)
                    </span>

                    <span>
                      <CreditCard size={14} />
                      {PAYMENT_LABELS[order.paymentMethod] || "COD"} —{" "}
                      <strong
                        className={
                          order.isPaid ? "pay-paid" : "pay-due"
                        }
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </strong>
                    </span>

                    {address.addressLine && (
                      <span>
                        <MapPin size={14} />
                        {address.addressLine}
                        {address.city ? `, ${address.city}` : ""}
                        {address.pincode ? ` - ${address.pincode}` : ""}
                        {address.phone ? ` · ${address.phone}` : ""}
                      </span>
                    )}
                  </div>

                  {/* ITEMS */}
                  {(order.items || []).length > 0 && (
                    <div className="admin-order-items">
                      {order.items.map((item, index) => (
                        <div
                          className="admin-order-item"
                          key={item._id || index}
                        >
                          {item.product?.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product?.name || "product"}
                              loading="lazy"
                            />
                          ) : (
                            <span className="admin-order-item-noimg">
                              <Package size={20} />
                            </span>
                          )}

                          <span className="admin-order-item-name">
                            {item.product?.name || "Product no longer available"}
                          </span>

                          <span className="admin-order-item-qty">
                            × {item.quantity}
                          </span>

                          {item.product?.price != null && (
                            <span className="admin-order-item-price">
                              ₹
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="admin-order-actions">
                    <label className="admin-order-status">
                      Status
                      <select
                        value={order.status}
                        disabled={saving}
                        onChange={(e) =>
                          updateOrder(order, { status: e.target.value })
                        }
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    {!order.isPaid && (
                      <button
                        className="admin-action-btn"
                        disabled={saving}
                        onClick={() =>
                          updateOrder(order, { isPaid: true })
                        }
                      >
                        Mark as Paid
                      </button>
                    )}

                    {order.status === "pending" && (
                      <button
                        className="admin-action-btn"
                        disabled={saving}
                        onClick={() =>
                          updateOrder(order, { status: "shipped" })
                        }
                      >
                        Mark as Shipped
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        className="admin-action-btn"
                        disabled={saving}
                        onClick={() =>
                          updateOrder(order, { status: "delivered" })
                        }
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {saving && (
                      <span className="admin-saving">Saving...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
