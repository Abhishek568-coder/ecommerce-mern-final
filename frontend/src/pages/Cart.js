import { useEffect, useState } from "react";
import API from "../api";
import "./cart.css";
import { toast } from "react-toastify";

function Cart() {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");

  // 🔥 FETCH CART
  const fetchCart = async () => {
    try {
      const res = await API.get("/api/cart", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const cleanItems = (res.data.items || []).filter(
        (item) => item.product
      );

      setCart({ ...res.data, items: cleanItems });

    } catch (err) {
      console.log("❌ FETCH CART ERROR:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔥 UPDATE QTY
  const updateQty = async (item, type) => {
    if (!item.product) return;

    try {
      await API.post(
        "/api/cart/update",
        {
          productId: item.product._id,
          action: type === "inc" ? "increase" : "decrease",
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      fetchCart();

    } catch (err) {
      console.log("❌ UPDATE QTY ERROR:", err.response?.data || err);
    }
  };

  // 🔥 DELETE ITEM
  const removeItem = async (item) => {
    if (!item.product) return;

    try {
      await API.post(
        "/api/cart/remove",
        { productId: item.product._id },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      fetchCart();

    } catch (err) {
      console.log("❌ REMOVE ITEM ERROR:", err.response?.data || err);
    }
  };

  // 🔥 PLACE ORDER
  const handleOrder = async () => {
    try {
      if (!address.trim()) {
          console.log("EMPTY ADDRESS");
        toast.error("Please enter delivery address", {
  position: "top-right",
});
        
        return;
      }

      const res = await API.post(
        "/api/orders",
        { address },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      console.log("✅ ORDER SUCCESS:", res.data);

      toast.success("Order placed successfully ✅");

      setAddress("");
      fetchCart();

    } catch (err) {
      console.log("❌ FULL ERROR:", err);
      console.log("❌ RESPONSE:", err.response?.data);

      toast.success(err.response?.data?.message || "Order failed ❌");
    }
  };

  // 🔥 EMPTY
  if (!cart || !cart.items || cart.items.length === 0) {
    return <h2 style={{ padding: "20px" }}>Your cart is empty</h2>;
  }

  // 🔥 TOTAL
  const total = cart.items.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  return (
    <div className="cart-container">
      <div className="cart-box">

        <h2 className="cart-title">Shopping Cart</h2>

        <div className="cart-header">
          <span></span>
          <span>Price</span>
        </div>

        {cart.items.map((item) => (
          <div className="cart-item" key={item._id}>

            <img src={item.product.image} alt="" />

            <div className="cart-details">

              <h3>{item.product.name}</h3>

              <p className="stock">In stock</p>

              <p className="delivery">
                FREE delivery available at checkout
              </p>

              <div className="qty-box">
                <button
                  onClick={() => {
                    if (item.quantity === 1) {
                      removeItem(item);
                    } else {
                      updateQty(item, "dec");
                    }
                  }}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => updateQty(item, "inc")}>
                  +
                </button>
              </div>

              <div className="actions">
                <span onClick={() => removeItem(item)}>Delete</span>
              </div>

            </div>

            <div className="price">
              ₹{item.product.price}
            </div>

          </div>
        ))}

        <div className="subtotal">
          Subtotal ({cart.items.length} items): ₹{total}
        </div>

        <input
          type="text"
          placeholder="Enter delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button className="checkout-btn" onClick={handleOrder}>
            Place Order
          </button>
        </div>

      </div>
    </div>
  );
}

export default Cart;