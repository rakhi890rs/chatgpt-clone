// src/pages/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await api.post("/auth/logout"); // Call backend to clear cookie
        navigate("/login");             // Redirect to login page
      } catch (err) {
        console.error(err);
        navigate("/login");             // Still redirect if error
      }
    };

    logoutUser();
  }, [navigate]);

  return <div style={{ textAlign: "center", marginTop: "50px" }}>Logging out...</div>;
}

export default Logout;