import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isProductsPage = location.pathname === "/products";

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");

    if (searchQuery) {
      setSearch(searchQuery);
    } else {
      setSearch("");
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${search}`);
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/products");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    navigate("/login");
  };

  return (
    <div
      className={`navbar ${isProductsPage
          ? "navbar-home"
          : "navbar-inner"
        }`}
    >
      <h2
        className={`logo ${isProductsPage ? "logo-light" : "logo-dark"
          }`}
        onClick={() => navigate("/products")}
      >
        APEX ATHLETICS
      </h2>

      {isLoginPage ? (

        <button
          className="home-btn"
          onClick={() => navigate("/products")}
        >
          ← Home
        </button>

      ) : (
        <>
          {/* SEARCH */}
          <form className="search-form" onSubmit={handleSearch}>
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                type="text"
                className="search"
                placeholder="Search for products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <span
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#777",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </span>
              )}
            </div>

            <button
              type="submit"
              className="search-btn"
            >
              🔍
            </button>
          </form>

          {/* NAVIGATION */}
          <div className="nav-links">

            <Link
              className={isProductsPage ? "nav-light" : "nav-dark"}
              to="/products"
              onClick={clearSearch}
            >
              Products
            </Link>

            <Link
              className={isProductsPage ? "nav-light" : "nav-dark"}
              to="/cart"
            >
              Cart
            </Link>

            <Link
              className={isProductsPage ? "nav-light" : "nav-dark"}
              to="/orders"
            >
              Orders
            </Link>

            {!user ? (
              <Link
                className={isProductsPage ? "nav-light" : "nav-dark"}
                to="/login"
              >
                Login
              </Link>
            ) : (
              <div className="user-menu">

                <span
                  className={`username ${isProductsPage ? "nav-light" : "nav-dark"
                    }`}
                  onClick={() => setOpen(!open)}
                >
                  👋 {user.name}
                </span>

                {open && (
                  <div className="dropdown">
                    <span onClick={handleLogout}>
                      Logout
                    </span>
                  </div>
                )}

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default Navbar;