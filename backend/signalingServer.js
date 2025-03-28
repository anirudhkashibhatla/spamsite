const { Server } = require("socket.io");
const http = require("http");

// Create an HTTP server
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (update this for production)
    methods: ["GET", "POST"],
  },
});

// Handle client connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle signaling messages
  socket.on("signal", (data) => {
    console.log("Signal received:", data);

    // Forward the signal to the target peer
    const { target, signal } = data;
    if (target) {
      console.log(`Forwarding signal to target: ${target}`);
      io.to(target).emit("signal", { sender: socket.id, signal });
    } else {
      console.error("Target not specified in signal data.");
    }
  });

  // Notify other clients when a peer disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
