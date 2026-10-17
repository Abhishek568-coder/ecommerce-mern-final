
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  getGuestCart,
  isLoggedIn,
  removeFromGuestCart,
  updateGuestCartQty,
} from "../cartStorage";
import "./cart.css";
import { toast } from "react-toastify";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);

  // Load guest cart
  const loadGuestCart = useCallback(() => {
    const items = getGuestCart().filter((item) => item.product);
    setCart({ items });
  }, []);

  // Fetch cart from backend or local storage
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      loadGuestCart();
      return;
    }

    try {
      const res = await API.get("/api/cart");

      const cleanItems = (res.data.items || []).filter(
        (item) => item.product
      );

      setCart({ ...res.data, items: cleanItems });
    } catch (err) {
      console.error("FETCH CART ERROR:", err.response?.data || err);

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        loadGuestCart();
        return;
      }

      toast.error(
        err.response?.data?.message || "Failed to load cart"
      );
    }
  }, [loadGuestCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Update quantity
  const updateQty = async (item, type) => {
    if (!item.product) return;

    if (!isLoggedIn()) {
      updateGuestCartQty(
        item.product._id,
        type === "inc" ? "increase" : "decrease"
      );
      loadGuestCart();
      return;
    }

    try {
      await API.post("/api/cart/update", {
        productId: item.product._id,
        action: type === "inc" ? "increase" : "decrease",
      });

      await fetchCart();
    } catch (err) {
      console.error("UPDATE QTY ERROR:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to update quantity"
      );
    }
  };

  // Remove item
  const removeItem = async (item) => {
    if (!item.product) return;

    if (!isLoggedIn()) {
      removeFromGuestCart(item.product._id);
      loadGuestCart();
      toast.success("Item removed from bag");
      return;
    }

    try {
      await API.post("/api/cart/remove", {
        productId: item.product._id,
      });

      await fetchCart();
      toast.success("Item removed from bag");
    } catch (err) {
      console.error("REMOVE ITEM ERROR:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to remove item"
      );
    }
  };

  // Proceed to checkout (delivery details + payment live there now)
  const goToCheckout = () => {
    if (!isLoggedIn()) {
      toast.error("Please login to checkout.");
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  // Loading state
  if (cart === null) {
    return (
      <div className="cart-container">
        <div className="cart-box">
          <p>Loading your bag...</p>
        </div>
      </div>
    );
  }

  // Calculate subtotal
  const total = cart.items.reduce((acc, item) => {
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  return (
    <div className="cart-container">
      <div className="cart-box">

        {/* Header */}
        <div className="cart-page-header">
          <h2 className="cart-title">Bag</h2>
          <span>{cart.items.length} items</span>
        </div>

        <div className="cart-layout">

          {/* Left: Cart items */}
          <section className="cart-products">
            {/* <div className="shipping-notice">
              <strong>Not in a hurry?</strong>
              <p>Select free shipping at checkout.</p>
            </div> */}

            {cart.items.length === 0 ? (
              <div className="empty-cart">
                <h3>Your bag is empty.</h3>
                <p>Looks like you haven't added anything yet.</p>
                <button
                  className="continue-shopping-btn"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="cart-items-scroll">
                {cart.items.map((item) => (
                  <div
                    className="cart-item"
                    key={item._id || item.product._id}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                    />

                    <div className="cart-details">
                      <h3>{item.product.name}</h3>

                      <p className="product-category">
                        {item.product.category || "Product"}
                      </p>

                      <p className="stock">In stock</p>

                      <p className="delivery">
                        Free shipping available at checkout
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
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => updateQty(item, "inc")}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="actions">
                        <button onClick={() => removeItem(item)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="price">
                      ₹{(
                        Number(item.product.price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery details now collected on the checkout screen */}
          </section>

          {/* Right: Order summary */}
          <aside className="cart-summary">
            <h2>Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>Free</span>
            </div>

            <div className="summary-row">
              <span>Estimated Tax</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            {!isLoggedIn() && (
              <p className="guest-notice">
                Shopping as a guest. Login to checkout.
              </p>
            )}

            <button
              className="checkout-btn"
              onClick={goToCheckout}
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default Cart;
