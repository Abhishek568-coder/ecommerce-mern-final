import { useState } from "react";
import API from "../api";
import { mergeGuestCart } from "../cartStorage";
import "./login.css";
import { toast } from "react-toastify";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 BASIC VALIDATION
    if (!email || !password || (isSignup && !name)) {
      return toast.error("Please fill all required fields");
    }

    try {
      const url = isSignup ? "/api/auth/register" : "/api/auth/login";
      // ✅ REMOVE AGE (important)
      const payload = isSignup
        ? { name, email, password }
        : { email, password };

      const res = await API.post(url, payload);

      console.log("✅ SUCCESS:", res.data);

      const user = res.data.user;

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ SAVE USER
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ MOVE THE GUEST (SESSION) CART INTO THE ACCOUNT
      await mergeGuestCart();

      // ✅ REDIRECT — admins land on the dashboard, users on the store
      window.location.href = user?.role === "admin" ? "/admin" : "/";

    } catch (err) {
      console.log("❌ FULL ERROR:", err);
      console.log("❌ RESPONSE:", err.response?.data);

      toast.error(err.response?.data?.message || "Login/Signup failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <h2 className="login-title">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>

          {isSignup && (
            <>
              <input
                placeholder="Name"
                className="login-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn">
            {isSignup ? "Sign Up" : "Login"}
          </button>

        </form>

        <p className="login-switch" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? (
            <>
              Already have an account? <strong>Login</strong>
            </>
          ) : (
            <>
              Don't have an account? <strong>Sign Up</strong>
            </>
          )}
        </p>

      </div>
    </div>
  );
}

export default Login;