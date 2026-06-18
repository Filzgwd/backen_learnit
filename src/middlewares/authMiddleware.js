const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ditemukan"
      });
    }

    // Check if header has Bearer prefix
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Format token salah, harus 'Bearer TOKEN'"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded =
      jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token sudah expired"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Token tidak valid"
      });
    }

    res.status(401).json({
      message: "Unauthorized: " + error.message
    });

  }
};