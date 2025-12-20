import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "../config";

// 1. Accept 'onLoginSuccess' to match the prop passed from App.js
export default function GoogleLoginButton({ onLoginSuccess }) {

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log("Google response:", credentialResponse);

      // 2. Send as JSON object (standard practice)
      // This matches the backend expectation we set up earlier
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        idToken: credentialResponse.credential
      });

      console.log("Backend Verified User:", res.data);

      // 3. Call the parent function if it exists
      if (onLoginSuccess) {
        onLoginSuccess(res.data);
      }

    } catch (err) {
      console.error("Login verification failed:", err);
    }
  };

  return (
    <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
          theme="filled_blue"
          shape="pill"
        />
    </div>
  );
}