// src/pages/Register.jsx
import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        fullname: { firstName: formData.firstName, lastName: formData.lastName },
        email: formData.email,
        password: formData.password,
      });
      alert(data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required style={{ width: "100%", margin: "5px 0" }} />
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Register</button>
      </form>
    </div>
  );
}

export default Register;