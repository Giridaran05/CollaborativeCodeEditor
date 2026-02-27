const Room = require("../models/Room");

const editorSocket = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // ==============================
    // 🔹 JOIN ROOM
    // ==============================
    socket.on("join_room", async (roomId) => {
      try {
        socket.join(roomId);

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

        // Optional: consider debouncing in production
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

      // Later we can emit user_leave for active users panel
      // socket.to(roomId).emit("user_left", socket.id);
    });

  });

};

module.exports = editorSocket;