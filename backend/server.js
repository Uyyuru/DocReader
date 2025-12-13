require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // ✅ IMPORTANT
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const docRoutes = require("./routes/docRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// ========== MIDDLEWARES ==========
app.use(express.json());
app.use(cookieParser());  // ✅ REQUIRED FOR req.cookies.token

// CORS setup (cookie support)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ========== CONNECT TO DB ==========
connectDB();

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/chat", chatRoutes);

// ========== START SERVER ==========
app.listen(5000, () => console.log("Server running on port 5000"));
