import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api";
import "./products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");

  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const searchParam = query.get("search");
  const cleanSearch = searchParam ? searchParam.toLowerCase().trim() : "";

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        let data = [];

        if (Array.isArray(res.data)) data = res.data;
        else if (res.data.products) data = res.data.products;
        else if (res.data.data) data = res.data.data;

        setProducts(data);
      })
      .catch((err) => console.log(err));
  }, []);

  // 🔥 ADD TO CART
  const addToCart = async (id) => {
    try {
      await API.post(
        "/cart",
        { productId: id, quantity: 1 },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 FINAL FIXED FILTER
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

        <div
          className={`cat ${category === "" ? "active-cat" : ""}`}
          onClick={() => setCategory("")}
        >
          All
        </div>

        <div
          className={`cat ${category === "swimming" ? "active-cat" : ""}`}
          onClick={() => setCategory("swimming")}
        >
          Swimming
        </div>

        <div
          className={`cat ${category === "activewear" ? "active-cat" : ""}`}
          onClick={() => setCategory("activewear")}
        >
          Activewear
        </div>

        <div
          className={`cat ${category === "gym" ? "active-cat" : ""}`}
          onClick={() => setCategory("gym")}
        >
          Gym
        </div>

        <div
          className={`cat ${category === "cycling" ? "active-cat" : ""}`}
          onClick={() => setCategory("cycling")}
        >
          Cycling
        </div>

        <div
          className={`cat ${category === "hiking" ? "active-cat" : ""}`}
          onClick={() => setCategory("hiking")}
        >
          Hiking
        </div>

        <div
          className={`cat ${category === "shoes" ? "active-cat" : ""}`}
          onClick={() => setCategory("shoes")}
        >
          Shoes
        </div>

        <div
          className={`cat ${category === "bags" ? "active-cat" : ""}`}
          onClick={() => setCategory("bags")}
        >
          Bags
        </div>

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