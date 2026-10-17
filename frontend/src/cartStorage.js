import API from "./api";

// 🔥 GUEST (SESSION) CART
// Stored in localStorage so a user can shop without logging in.
// Items keep the same shape as the server cart: { product, quantity }
// so Cart.js can render both without changes.

const GUEST_CART_KEY = "guestCart";

export const isLoggedIn = () => Boolean(localStorage.getItem("token"));

const readCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("guestCartUpdated"));
};

export const getGuestCart = () => readCart();

export const getGuestCartCount = () =>
  readCart().reduce((sum, item) => sum + (item.quantity || 0), 0);

export const addToGuestCart = (product, quantity = 1) => {
  const items = readCart();
  const existing = items.find((i) => i.product?._id === product._id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }

  writeCart(items);
  return items;
};

export const updateGuestCartQty = (productId, action) => {
  let items = readCart();
  const item = items.find((i) => i.product?._id === productId);

  if (!item) return items;

  if (action === "increase") {
    item.quantity += 1;
  } else {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      items = items.filter((i) => i.product?._id !== productId);
    }
  }

  writeCart(items);
  return items;
};

export const removeFromGuestCart = (productId) => {
  const items = readCart().filter((i) => i.product?._id !== productId);
  writeCart(items);
  return items;
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event("guestCartUpdated"));
};

// 🔥 Merge the guest cart into the logged-in user's server cart, then clear it.
export const mergeGuestCart = async () => {
  const items = readCart();

  if (!items.length) return;

  const results = await Promise.allSettled(
    items.map((item) =>
      API.post("/api/cart", {
        productId: item.product?._id,
        quantity: item.quantity,
      })
    )
  );

  const failed = results.filter((r) => r.status === "rejected");

  if (failed.length) {
    console.log("GUEST CART MERGE PARTIAL FAILURE:", failed);
  }

  clearGuestCart();
};
