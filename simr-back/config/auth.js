// const passport = require('../config/passport');
const passport = require("passport");

// Middleware para rutas protegidas
const requireAuth = (req, res, next) => {
  passport.authenticate('jwt-access', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (!user) {
      return res.status(401).json({
        message: 'Token requerido',
        expired: info?.name === 'TokenExpiredError'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };