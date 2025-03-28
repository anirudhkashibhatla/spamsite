const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track rooms and their participants
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("webrtc-offer", (data) => {
    console.log("Received WebRTC offer in room", data.roomId);
    socket.to(data.roomId).emit("webrtc-offer", data);
  });

  socket.on("webrtc-answer", (data) => {
    console.log("Received WebRTC answer in room", data.roomId);
    socket.to(data.roomId).emit("webrtc-answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("Received ICE candidate in room", data.roomId);
    socket.to(data.roomId).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    // Clean up room memberships
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
