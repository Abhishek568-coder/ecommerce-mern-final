import axios from "axios";

const API = axios.create({
  baseURL: "https://ecommerce-backend-urft.onrender.com"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = token; // ✅ NO Bearer (your backend expects raw token)
  }

  return req;
});

export default API;