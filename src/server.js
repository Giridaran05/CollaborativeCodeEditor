require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./src/config/db");
const editorSocket = require("./src/sockets/editorSocket");
const roomRoutes = require("./src/routes/roomRoutes");

// ===============================
// 🔹 Initialize App
// ===============================
const app = express();

// ===============================
// 🔹 Connect Database
// ===============================
connectDB();

// ===============================
// 🔹 Middleware
// ===============================
const CLIENT_URL = process.env.CLIENT_URL || "*";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

// ===============================
// 🔹 Health Check Route (Important for Render)
// ===============================
app.get("/", (req, res) => {
  res.send("Collaborative Code Editor Backend is Running 🚀");
});

// ===============================
// 🔹 API Routes
// ===============================
app.use("/api/rooms", roomRoutes);

// ===============================
// 🔹 Create HTTP Server
// ===============================
const server = http.createServer(app);

// ===============================
// 🔹 Initialize Socket.io
// ===============================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ===============================
// 🔹 Attach Editor Socket Logic
// ===============================
editorSocket(io);

// ===============================
// 🔹 Start Server
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});