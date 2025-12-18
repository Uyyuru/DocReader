import axios from "axios";

const api = axios.create({
  baseURL: "https://docreader-5a1j.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
