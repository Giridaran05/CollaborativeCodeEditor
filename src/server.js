require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const editorSocket = require("./sockets/editorSocket");
const roomRoutes = require("./routes/roomRoutes");

// ==============================
// 🔹 Initialize App FIRST
// ==============================
const app = express();

// ==============================
// 🔹 Connect Database
// ==============================
connectDB();

// ==============================
// 🔹 CORS Configuration
// ==============================
const CLIENT_URL = process.env.CLIENT_URL || "*";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

// ==============================
// 🔹 Routes
// ==============================
app.use("/api/rooms", roomRoutes);

// ==============================
// 🔹 Create HTTP Server
// ==============================
const server = http.createServer(app);

// ==============================
// 🔹 Initialize Socket.io
// ==============================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// ==============================
// 🔹 Attach Socket Logic
// ==============================
editorSocket(io);

// ==============================
// 🔹 Start Server
// ==============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});