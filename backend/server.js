require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const docRoutes = require("./routes/docRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());  

app.use(cors({
  origin: "https://doc-reader-psi.vercel.app",
  credentials: true
}));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/chat", chatRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));
