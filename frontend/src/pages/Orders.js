import { useEffect, useState } from "react";
import API from "../api";
import "./orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  if (!orders.length) {
    return <h2 style={{ padding: "20px" }}>No orders found</h2>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Your Orders</h2>

      {orders.map((order) => {

        // 🔥 SAFE TOTAL (fallback if missing)
        const total =
          order.total ??
          order.items.reduce((acc, item) => {
            if (!item.product) return acc;
            return acc + item.product.price * item.quantity;
          }, 0);

        return (
          <div className="order-card" key={order._id}>

            {/* HEADER */}
            <div className="order-header">
              <span className={`status ${order.status}`}>
                {order.status}
              </span>

              <span className="total">
                Total: ₹{total.toLocaleString()}
              </span>
            </div>

            {/* PRODUCTS */}
            <div className="order-items">
              {(order.items || []).map((item, index) => {

                // 🔥 skip broken items
                if (!item.product) return null;

                return (
                  <div className="order-item" key={index}>

                    <img
                      src={item.product.image}
                      alt=""
                      className="order-img"
                    />

                    <div className="order-details">
                      <h4>{item.product.name}</h4>
                      <p>₹{item.product.price}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default Orders;