const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key"; // Replace with a secure key

const verifyToken = (req, res, next) => {
  console.log("verifyToken middleware triggered");

  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header missing or invalid");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded Token:", decoded);

    req.roomId = decoded.roomId; // Attach roomId to the request object
    console.log("Token verified successfully. Room ID:", req.roomId);

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
