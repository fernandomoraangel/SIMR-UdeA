"use strict";

module.exports = function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No autenticado. Se requiere inicio de sesión.",
    });
  }
  next();
};