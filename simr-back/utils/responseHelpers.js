// Respuesta exitosa genérica
function successResponse(
  res,
  message = "Operación exitosa",
  statusCode = 200,
  data = {}
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

// Respuesta de error genérica
function errorResponse(
  res,
  message = "Error interno del servidor",
  statusCode = 500,
  data = {}
) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}

// Respuesta al iniciar sesión o registrarse exitosamente (LOGIN / SIGNUP / VERIFY TOKEN / REFRESH TOKEN)
function authSuccessResponse(res, message, statusCode = 200, user, expiresIn) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      tokenInfo: {
        expiresIn,
      },
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
  authSuccessResponse,
};
