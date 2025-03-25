const express = require("express");
const jwt = require("jsonwebtoken");
const Room = require("../models/Room");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Replace with a secure key

console.log("Room Routes");

// Create a new room
router.post("/create", async (req, res) => {
  const { roomId, password, roomLife, layout, upvote, rateLimit, maxDuration } =
    req.body;
  console.log("POST /api/rooms/create hit");

  if (!/^\d+$/.test(roomId)) {
    console.log("Received roomId:", roomId);

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
      createdAt: new Date(), // This will store the current time in UTC
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

// Authenticate room password
router.post("/:roomId/authenticate", async (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body;

  console.log(`POST /api/rooms/${roomId}/authenticate hit`);

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    if (room.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate a token for the authenticated user
    const token = jwt.sign({ roomId }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({
      success: true,
      token,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Error during room authentication:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get room details (conditionally protected route)
router.get("/:roomId", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // If token exists, verify it
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log("Token verified successfully. Room ID:", decoded.roomId);
      req.roomId = decoded.roomId; // Attach roomId to the request object
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
    }
  }

  // Fetch room details
  const { roomId } = req.params;
  console.log("Fetching room with ID:", roomId);

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      roomId: room.roomId,
      roomLife: room.roomLife,
      layout: room.layout,
      upvote: room.upvote,
      rateLimit: room.rateLimit,
      maxDuration: room.maxDuration,
      createdAt: room.createdAt,
      requiresPassword: !!room.password, // Indicate if the room requires a password
    });
  } catch (error) {
    console.error("Error fetching room:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
