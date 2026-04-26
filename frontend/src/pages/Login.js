import { useState } from "react";
import API from "../api";
import "./login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState(""); // optional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 BASIC VALIDATION
    if (!email || !password || (isSignup && !name)) {
      return alert("Please fill all required fields");
    }

    try {
      const url = isSignup ? "/api/auth/register" : "/api/auth/login";
      // ✅ REMOVE AGE (important)
      const payload = isSignup
        ? { name, email, password }
        : { email, password };

      const res = await API.post(url, payload);

      console.log("✅ SUCCESS:", res.data);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ SAVE USER
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ REDIRECT
      window.location.href = "/products";

    } catch (err) {
      console.log("❌ FULL ERROR:", err);
      console.log("❌ RESPONSE:", err.response?.data);

      alert(err.response?.data?.message || "Login/Signup failed ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

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

        <p
          style={{ marginTop: "15px", cursor: "pointer", color: "#2a5bd7" }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>

      </div>
    </div>
  );
}

export default Login;