const Room = require("../models/Room");

const deleteExpiredRooms = async () => {
  try {
    const now = Date.now();
    await Room.deleteMany({
      $expr: {
        $lte: [
          { $add: ["$createdAt", { $multiply: ["$roomLife", 1000] }] },
          now,
        ],
      },
    });
    console.log("Expired rooms deleted successfully.");
  } catch (error) {
    console.error("Error deleting expired rooms:", error);
  }
};

module.exports = deleteExpiredRooms;
