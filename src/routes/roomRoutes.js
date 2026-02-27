const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// 🔹 Get all versions of a room
router.get("/versions/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne(
      { roomId: req.params.roomId },
      { versions: 1, _id: 0 }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const sortedVersions = room.versions.sort(
      (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
    );

    res.status(200).json(sortedVersions);

  } catch (error) {
    console.error("Fetch Versions Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;