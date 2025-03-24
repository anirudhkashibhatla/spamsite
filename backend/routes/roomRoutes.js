const express = require("express");
const Room = require("../models/Room");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { roomId, password, roomLife, layout, upvote, rateLimit, maxDuration } =
    req.body;

  if (!/^\d+$/.test(roomId)) {
    return res.status(400).json({ error: "Room ID must be numeric" });
  }

  try {
    const effectiveRoomLife = roomLife
      ? parseInt(roomLife, 10)
      : Number.MAX_SAFE_INTEGER;

    const newRoom = new Room({
      roomId,
      password,
      roomLife: effectiveRoomLife,
      layout,
      upvote,
      rateLimit,
      maxDuration,
      createdAt: new Date(),
    });

    await newRoom.save();
    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;

  if (!/^\d+$/.test(roomId)) {
    return res
      .status(400)
      .json({ error: "Invalid Room ID format. Must be numeric." });
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
