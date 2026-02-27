const Room = require("../models/Room");

// 🔹 In-memory room user tracking
const activeRooms = {};

const editorSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ==============================
    // 🔹 JOIN ROOM
    // ==============================
    socket.on("join_room", async (roomId) => {
      try {
        socket.join(roomId);

        // Track user in memory
        if (!activeRooms[roomId]) {
          activeRooms[roomId] = [];
        }

        const user = {
          id: socket.id,
          username: "User_" + socket.id.slice(0, 4)
        };

        activeRooms[roomId].push(user);

        // Send active users list to room
        io.to(roomId).emit("active_users", activeRooms[roomId]);

        let room = await Room.findOne({ roomId });

        if (!room) {
          room = await Room.create({ roomId });
        }

        socket.emit("load_code", room.code);

      } catch (error) {
        console.error("Join Room Error:", error);
      }
    });

    // ==============================
    // 🔹 RESTORE VERSION
    // ==============================
    socket.on("restore_version", async ({ roomId, code }) => {
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { code },
          { upsert: true }
        );

        io.to(roomId).emit("receive_code", code);

      } catch (error) {
        console.error("Restore Error:", error);
      }
    });

    // ==============================
    // 🔹 CODE CHANGE
    // ==============================
    socket.on("code_change", async ({ roomId, code }) => {
      try {
        socket.to(roomId).emit("receive_code", code);

        await Room.findOneAndUpdate(
          { roomId },
          { code },
          { upsert: true }
        );

      } catch (error) {
        console.error("Code Change Error:", error);
      }
    });

    // ==============================
    // 🔹 SAVE VERSION
    // ==============================
    socket.on("save_version", async ({ roomId, code }) => {
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $push: { versions: { code } } },
          { upsert: true }
        );

      } catch (error) {
        console.error("Save Version Error:", error);
      }
    });

    // ==============================
    // 🔹 CURSOR MOVEMENT
    // ==============================
    socket.on("cursor_move", ({ roomId, position, userId, username }) => {
      socket.to(roomId).emit("receive_cursor", {
        position,
        userId,
        username
      });
    });

    // ==============================
    // 🔹 DISCONNECT
    // ==============================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Remove user from all rooms
      for (const roomId in activeRooms) {
        activeRooms[roomId] = activeRooms[roomId].filter(
          (user) => user.id !== socket.id
        );

        // Update active users list
        io.to(roomId).emit("active_users", activeRooms[roomId]);

        // Clean empty rooms
        if (activeRooms[roomId].length === 0) {
          delete activeRooms[roomId];
        }
      }
    });
  });
};

module.exports = editorSocket;