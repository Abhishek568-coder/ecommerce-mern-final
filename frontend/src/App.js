import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Navbar />   {/* 🔥 ADD THIS */}

      <Routes>
        {/* Products is now the homepage */}
        <Route path="/" element={<Products />} />

        <Route
          path="/admin"
          element={<Admin />}
        />
        <Route path="/login" element={<Login />} />

        {/* keep /products working as an alias for old links/bookmarks */}
        <Route path="/products" element={<Products />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;