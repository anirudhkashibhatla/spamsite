const Room = require("../models/Room");

const deleteExpiredRooms = async () => {
  try {
    const now = Date.now();
    console.log("Current timestamp:", now);

    // Find rooms that are about to be deleted
    const expiredRooms = await Room.find({
      $expr: {
        $lte: [
          { $add: ["$createdAt", { $multiply: ["$roomLife", 1000] }] },
          new Date(now),
        ],
      },
    });

    if (expiredRooms.length > 0) {
      console.log("Expired rooms to be deleted:");
      expiredRooms.forEach((room) => {
        console.log(
          `Room ID: ${room.roomId}, Created At: ${room.createdAt}, Room Life: ${room.roomLife}`
        );
      });
    } else {
      console.log("No expired rooms found for deletion.");
    }

    // Delete the expired rooms
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
