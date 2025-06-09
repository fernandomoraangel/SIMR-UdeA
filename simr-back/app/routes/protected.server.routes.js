const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../config/auth');

// Ruta que requiere autenticación
router.get('/dashboard', requireAuth, (req, res) => {
  res.json({ 
    message: 'Dashboard data',
    user: req.user.name 
  });
});

// Ruta que requiere rol específico
router.get('/admin', requireAuth, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin panel data' });
});

module.exports = router;