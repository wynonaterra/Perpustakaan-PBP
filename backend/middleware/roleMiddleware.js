const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.peran)) {
      return res.status(403).json({
        message: `Akses terlarang. Hanya role (${allowedRoles.join(', ')}) yang diizinkan.`,
      });
    }
    next();
  };
};

module.exports = authorizeRoles;