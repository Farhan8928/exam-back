const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ message: "Account disabled" });
    }

    if (user.mustChangePassword) {
      const allowedPaths = ["/api/auth/me", "/api/auth/change-password", "/api/auth/logout"];
      if (!allowedPaths.includes(req.path)) {
        return res.status(403).json({ message: "Password change required" });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { generateToken, verifyToken, authMiddleware, roleMiddleware };
