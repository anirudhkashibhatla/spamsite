const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  password: { type: String },
  roomLife: { type: Number, required: true }, // Room life in seconds
  layout: { type: String, default: "Default" },
  upvote: { type: String, default: "Disabled" },
  rateLimit: { type: Number, default: 0 },
  maxDuration: { type: Number, default: 60 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
