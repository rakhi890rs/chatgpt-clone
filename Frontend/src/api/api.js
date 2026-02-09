// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // your backend base URL
  withCredentials: true,               // to send cookies
});

export default api;