import axios from "axios";

// 🔧 API base URL
// - Local dev (npm start) -> frontend/.env.development sets REACT_APP_API_URL
//   to http://localhost:5000
// - Production build (npm run build) -> falls back to the deployed backend
const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://ecommerce-backend-urft.onrender.com",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = token; // ✅ NO Bearer (your backend expects raw token)
  }

  return req;
});

export default API;
