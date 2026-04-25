import { useState } from "react";
import API from "../api";
import "./login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isSignup ? "/auth/register" : "/auth/login";

      const payload = isSignup
        ? { name, age, email, password }
        : { email, password };

      const res = await API.post(url, payload);

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ HANDLE USER DATA SAFELY (VERY IMPORTANT)
      const userData = res.data.user
        ? res.data.user
        : {
            name: res.data.name,
            email: res.data.email,
            age: res.data.age,
          };

      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ FORCE REDIRECT (NO BUGS)
      window.location.href = "/products";

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert("Login/Signup failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

        <form onSubmit={handleSubmit}>

          {/* SIGNUP EXTRA FIELDS */}
          {isSignup && (
            <>
              <input
                placeholder="Name"
                className="login-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                placeholder="Age"
                className="login-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
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