// Middleware to check if the request is from an Admin
function requireAdmin(req, res, next) {
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'Admin') {
    return res.status(403).json({
      error: 'Access denied. Admin privileges required.'
    });
  }

  next();
}

module.exports = {
  requireAdmin
};
