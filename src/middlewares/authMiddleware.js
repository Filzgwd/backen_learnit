const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists
    if (!authHeader) {
      console.log('[AUTH] Token tidak ditemukan pada', req.method, req.path);
      return res.status(401).json({
        message: "Token tidak ditemukan"
      });
    }

    // Check if header has Bearer prefix
    if (!authHeader.startsWith("Bearer ")) {
      console.log('[AUTH] Format token salah:', authHeader);
      return res.status(401).json({
        message: "Format token salah, harus 'Bearer TOKEN'"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded =
      jwt.verify(token, process.env.JWT_SECRET || 'secret');

    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId,
      userId: decoded.userId || decoded.id,
    };
    console.log('[AUTH] User authenticated:', req.user.id, 'Role:', req.user.role);

    next();

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      console.log('[AUTH] Token expired');
      return res.status(401).json({
        message: "Token sudah expired"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      console.log('[AUTH] Token tidak valid:', error.message);
      return res.status(401).json({
        message: "Token tidak valid"
      });
    }

    console.log('[AUTH] Error:', error.message);
    res.status(401).json({
      message: "Unauthorized: " + error.message
    });

  }
};
