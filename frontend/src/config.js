// src/config.js

// 1. Get the hostname from Render (e.g., skillforge-backend.onrender.com)
//    OR use localhost if running locally
const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost:8080";

// 2. Determine if we need https (Render) or http (Localhost)
const protocol = process.env.REACT_APP_BACKEND_HOST ? "https" : "http";

// 3. Export the final API URL
export const API_BASE_URL = `${protocol}://${backendHost}/api`;