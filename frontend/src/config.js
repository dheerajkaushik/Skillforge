// src/config.js

// 1. Check if the website is running on your laptop (localhost)
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// 2. Export the correct API URL based on where we are
//    - If on Localhost -> Use http://localhost:8080/api
//    - If on Render    -> Use https://skillforge-backend-osg6.onrender.com/api
export const API_BASE_URL = isLocalhost
  ? "http://localhost:8080/api"
  : "https://skillforge-backend-osg6.onrender.com/api";