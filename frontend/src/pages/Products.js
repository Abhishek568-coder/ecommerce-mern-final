import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api";
import "./products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const searchParam = query.get("search");
  const cleanSearch = searchParam ? searchParam.toLowerCase().trim() : "";

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    API.get("/api/products")
      .then((res) => {
        let data = [];

        if (Array.isArray(res.data)) data = res.data;
        else if (res.data.products) data = res.data.products;
        else if (res.data.data) data = res.data.data;

        setProducts(data);
      })
      .catch((err) => console.log("❌ PRODUCTS ERROR:", err));
  }, []);

  // 🔥 ADD TO CART (FINAL)
  const addToCart = async (id) => {
    try {
      await API.post("/api/cart", {
        productId: id,
        quantity: 1,
      });

      setMessage("Added to cart ✅");

      setTimeout(() => setMessage(""), 2000);

    } catch (err) {
      console.log("❌ ADD TO CART ERROR:", err.response?.data || err);

      setMessage("Failed to add ❌");

      setTimeout(() => setMessage(""), 2000);
    }
  };

  // 🔥 FILTER
  const filteredProducts = products.filter((p) => {
    const matchSearch = cleanSearch
      ? p.name?.toLowerCase().includes(cleanSearch)
      : true;

    const matchCategory = category
      ? p.category?.toLowerCase().trim().includes(category)
      : true;

    return matchSearch && matchCategory;
  });

  return (
    <div>

      {/* MESSAGE */}
      {message && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#222",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "6px",
          zIndex: 999
        }}>
          {message}
        </div>
      )}

      {/* MENU */}
      <div className="menu">
        <span>All Sports</span>
        <span>Men</span>
        <span>Women</span>
        <span>Kids</span>
        <span>Fitness</span>
        <span>Sale</span>
      </div>

      {/* BANNER */}
      <div className="banner">
        <h2>UP TO ₹300 OFF</h2>
        <p>Use Code: NC300</p>
      </div>

      {/* CATEGORY */}
      <div className="categories">
        {[
          "",
          "swimming",
          "activewear",
          "gym",
          "cycling",
          "hiking",
          "shoes",
          "bags",
        ].map((cat) => (
          <div
            key={cat}
            className={`cat ${category === cat ? "active-cat" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat === "" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="products">
        {filteredProducts.length === 0 ? (
          <p style={{ padding: "20px" }}>No products found</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p._id} className="card">
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
              <p className="price">₹{p.price}</p>

              <button onClick={() => addToCart(p._id)}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Products;