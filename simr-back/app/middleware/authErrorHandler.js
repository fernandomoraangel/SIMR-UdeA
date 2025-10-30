// Middleware para manejo específico de errores de autenticación
const handleAuthError = (err, req, res, next) => {
  console.log("=== AUTH ERROR HANDLER ===");
  console.log("Error:", err);
  console.log("URL:", req.url);
  console.log("Method:", req.method);

  // Si es una ruta de autenticación y hay un error
  if (req.url.includes("/api/auth/")) {
    // Errores específicos de JWT
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    // Error de estrategia de autenticación
    if (err.message && err.message.includes("passport")) {
      return res.status(401).json({
        success: false,
        message: "Error de autenticación",
      });
    }

    // Error genérico en rutas de auth
    console.error("Error de autenticación no manejado:", err);
    return res.status(401).json({
      success: false,
      message: "Error de autenticación",
    });
  }

  // Si es una ruta de búsqueda de metadatos, permitir sin autenticación
  if (req.url === "/api/search/metadata" && req.method === "GET") {
    return next();
  }

  // Si es una ruta de búsqueda y hay error de autenticación, devolver 401
  if (req.url.includes("/api/search/") && req.method === "GET") {
    return res.status(401).json({
      success: false,
      message: "Se requiere autenticación para usar la búsqueda",
    });
  }

  // Si no es una ruta de auth, pasar al siguiente middleware
  next(err);
};

module.exports = { handleAuthError };
