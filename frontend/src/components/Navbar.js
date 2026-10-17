import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft, UserRound } from "lucide-react";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isProductsPage =
    location.pathname === "/" || location.pathname === "/products";

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef(null);

  // ✨ Publish the real navbar height as --nav-h so sticky elements
  // (like the category bar) can sit exactly under it on any screen size.
  useEffect(() => {
    const el = navRef.current;

    if (!el) return;

    const setNavHeight = () => {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${el.offsetHeight}px`
      );
    };

    setNavHeight();

    let observer;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(setNavHeight);
      observer.observe(el);
    }

    window.addEventListener("resize", setNavHeight);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", setNavHeight);
    };
  }, []);

  // ✨ The products navbar floats transparently over the hero — once the
  // page is scrolled it becomes a solid bar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // white text only while it sits on top of the hero
  const lightText = isProductsPage && !scrolled;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");

    setMenuOpen(false);

    if (searchQuery) {
      setSearch(searchQuery);
    } else {
      setSearch("");
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      navigate("/");
      return;
    }

    navigate(`/?search=${search}`);
  };

  const clearSearch = () => {
    setSearch("");
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);
    setMenuOpen(false);

    navigate("/login");
  };

  return (
    <>
    <div
      ref={navRef}
      className={`navbar ${isProductsPage
          ? "navbar-home"
          : "navbar-inner"
        }${scrolled ? " navbar-scrolled" : ""}`}
    >
      <h2
        className={`logo ${lightText ? "logo-light" : "logo-dark"
          }`}
        onClick={() => navigate("/")}
      >
        APEX ATHLETICS
      </h2>

      {isLoginPage ? (

        <button
          className="home-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Home
        </button>

      ) : (
        <>
          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className={`hamburger ${menuOpen ? "is-open" : ""} ${lightText ? "hamburger-light" : "hamburger-dark"
              }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>

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
                  className="search-clear"
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "#777",
                  }}
                >
                  <X size={16} />
                </span>
              )}
            </div>

            <button
              type="submit"
              className="search-btn"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* NAVIGATION */}
          <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>

            <Link
              className={lightText ? "nav-light" : "nav-dark"}
              to="/"
              onClick={clearSearch}
            >
              Products
            </Link>

            <Link
              className={lightText ? "nav-light" : "nav-dark"}
              to="/cart"
              onClick={() => setMenuOpen(false)}
            >
              Cart
            </Link>

            <Link
              className={lightText ? "nav-light" : "nav-dark"}
              to="/orders"
              onClick={() => setMenuOpen(false)}
            >
              Orders
            </Link>

            {!user ? (
              <Link
                className={lightText ? "nav-light" : "nav-dark"}
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            ) : (
              <div className="user-menu">

                <span
                  className={`username ${lightText ? "nav-light" : "nav-dark"
                    }`}
                  onClick={() => setOpen(!open)}
                >
                  <UserRound size={16} />
                  {user.name}
                </span>

                {open && (
                  <div className="dropdown">
                    {user.role === "admin" && (
                      <span
                        className="dropdown-admin"
                        onClick={() => {
                          setOpen(false);
                          navigate("/admin");
                        }}
                      >
                        Admin Dashboard
                      </span>
                    )}

                    <span
                      className="dropdown-logout"
                      onClick={handleLogout}
                    >
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

    {/* MOBILE OVERLAY — tapping it closes the menu.
        It sits OUTSIDE the navbar so the navbar's
        backdrop-filter can't trap the fixed positioning. */}
    {menuOpen && (
      <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
    )}
    </>
  );
}

export default Navbar;