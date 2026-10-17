import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { addToGuestCart, isLoggedIn } from "../cartStorage";
import "./products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");

  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const searchParam = query.get("search");
  const cleanSearch = searchParam
    ? searchParam.toLowerCase().trim()
    : "";

  // HERO IMAGES
  const banners = [
    {
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400",
    },
    {
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400",
    },
    {
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1400",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1400",
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  // FETCH PRODUCTS
  useEffect(() => {
    API.get("/api/products")
      .then((res) => {
        let data = [];

        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.products) {
          data = res.data.products;
        } else if (res.data.data) {
          data = res.data.data;
        }

        setProducts(data);
      })
      .catch((err) =>
        console.log("PRODUCT ERROR:", err)
      );
  }, []);

  // AUTO SLIDER
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ADD TO CART
  const addToCart = async (product) => {
    // 🔥 GUEST → save to session (localStorage) cart, no login required
    if (!isLoggedIn()) {
      addToGuestCart(product, 1);
      toast.success("Added to Cart ✅ (login to save it to your account)");
      return;
    }

    try {
      await API.post("/api/cart", {
        productId: product._id,
        quantity: 1,
      });

      toast.success("Added to Cart ✅");
    } catch (err) {
      console.log("ADD TO CART ERROR:", err.response?.data || err);

      if (err.response?.status === 401) {
        // token missing/expired → fall back to the session cart
        addToGuestCart(product, 1);
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to Add ❌"
        );
      }
    }
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter((p) => {
    const matchSearch = cleanSearch
      ? p.name?.toLowerCase().includes(cleanSearch)
      : true;

    const matchCategory = category
      ? p.category?.toLowerCase().trim() === category
      : true;

    return matchSearch && matchCategory;
  });

  return (
    <div>
      {/* HERO SECTION */}
      <div
        style={{
          width: "100%",
          height: "500px",
          marginTop: "-80px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={banners[currentBanner].image}
          alt="banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.2))",
          }}
        ></div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "60px",
            transform: "translateY(-50%)",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "50px" }}>
            APEX ATHLETICS
          </h1>

          <p style={{ fontSize: "22px" }}>
            Premium Sports Equipment &
            Activewear
          </p>
        </div>

        {/* DOTS */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px",
          }}
        >
          {banners.map((_, index) => (
            <span
              key={index}
              onClick={() => setCurrentBanner(index)}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                cursor: "pointer",
                background:
                  currentBanner === index
                    ? "#fff"
                    : "rgba(255,255,255,0.5)",
              }}
            ></span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
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
            className={`cat ${category === cat ? "active-cat" : ""
              }`}
            onClick={() => setCategory(cat)}
          >
            {cat === ""
              ? "All"
              : cat.charAt(0).toUpperCase() +
              cat.slice(1)}
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="products">

        {filteredProducts.length === 0 ? (
          <h2
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            No products found
          </h2>
        ) : (
          filteredProducts.map((p) => {
            const seed =
              p._id
                .split("")
                .reduce((sum, char) => sum + char.charCodeAt(0), 0);

            const rating = (
              4 + ((seed % 9) + 1) / 10
            ).toFixed(1);

            const reviews =
              ((seed * 7) % 500) + 50;
            return (
              <div className="product-card" key={p._id}>

                <div className="card-top">

                  {/* <div className="wishlist">
                  ♡
                </div> */}

                  <img
                    src={p.image}
                    alt={p.name}
                    className="product-image"
                  />

                </div>

                <div className="card-bottom">

                  <h3>{p.name}</h3>

                  <div className="product-tags">
                    <span>{p.category}</span>
                    <span>In Stock</span>
                  </div>

                  <p className="product-description">
                    {p.description}
                  </p>

                  <div className="rating-row">
                    <span className="stars">
                      ⭐ {rating}
                    </span>

                    <span className="reviews">
                      ({reviews} reviews)
                    </span>
                  </div>

                  <div className="product-footer">

                    <div>
                      <p className="price-label">
                        PRICE
                      </p>

                      <h2 className="product-price">
                        ₹{p.price}
                      </h2>
                    </div>

                    <button
                      className="cart-btn"
                      onClick={() => addToCart(p)}
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Products;