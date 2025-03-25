const Room = require("../models/Room");

const deleteExpiredRooms = async () => {
  try {
    const now = Date.now();
    console.log("Current timestamp:", now);

    // Delete rooms where (createdAt + roomLife * 1000) is in the past
    const result = await Room.deleteMany({
      $expr: {
        $lte: [
          { $add: ["$createdAt", { $multiply: ["$roomLife", 1000] }] },
          new Date(now),
        ],
      },
    });

    console.log(
      `Expired rooms deleted successfully. Number of rooms deleted: ${result.deletedCount}`
    );
  } catch (error) {
    console.error("Error deleting expired rooms:", error);
  }
};

module.exports = deleteExpiredRooms;
