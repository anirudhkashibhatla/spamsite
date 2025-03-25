const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./db");
const roomRoutes = require("./routes/roomRoutes");
const deleteExpiredRooms = require("./utils/cleanup");

const app = express();
const PORT = 5000;
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(bodyParser.json());

connectDB();
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

app.use("/api/rooms", roomRoutes);
deleteExpiredRooms();
setInterval(deleteExpiredRooms, 5 * 60 * 1000); // Runs every 5 minutes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
