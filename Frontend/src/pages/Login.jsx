// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", formData);
      alert(data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Login</button>
      </form>
    </div>
  );
}

export default Login;