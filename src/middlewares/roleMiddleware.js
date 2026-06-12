module.exports = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== requiredRole) {
        console.log('USER ROLE:', req.user.role);
        console.log('REQUIRED ROLE:', requiredRole);
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};