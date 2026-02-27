require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const editorSocket = require("./sockets/editorSocket");
const roomRoutes = require("./routes/roomRoutes");
const runRoutes = require("./routes/runRoutes");

const app = express();

// 🔹 Connect DB
connectDB();

// 🔹 Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

// 🔹 Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/run", runRoutes);

// 🔹 Create server
const server = http.createServer(app);

// 🔹 Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

editorSocket(io);

// 🔹 IMPORTANT FIX FOR RENDER
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});