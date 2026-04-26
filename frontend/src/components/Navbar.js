import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // dropdown

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    navigate(`/products?search=${search}`);
    setSearch("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    window.location.href = "/login";
  };

  return (
    <div className="navbar">

      {/* LOGO */}
      <h2
        className="logo"
        onClick={() => navigate("/products")}
        style={{ cursor: "pointer" }}
      >
        APEX ATHLETICS
      </h2>

      {/* SEARCH */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>

      {/* NAV */}
      <div className="nav-links">
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>

        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <div className="user-menu">

            <span
              className="username"
              onClick={() => setOpen(!open)}
              style={{ cursor: "pointer" }}
            >
              👋 {user.name}
            </span>

            {open && (
              <div className="dropdown">
                <span onClick={handleLogout}>Logout</span>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;