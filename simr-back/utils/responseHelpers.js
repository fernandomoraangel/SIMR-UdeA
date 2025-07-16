// Respuesta exitosa genérica
function successResponse(res, message = 'Operación exitosa', statusCode = 200, data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

// Respuesta de error genérica
function errorResponse(res, message = 'Error interno del servidor', statusCode = 500, data = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data
  });
}

// Respuesta al iniciar sesión o registrarse exitosamente (LOGIN / SIGNUP)
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

// Respuesta al renovar el token (sin necesidad de reenviar usuario) (REFRESH TOKEN)
function tokenRefreshResponse(res, message = 'Token actualizado exitosamente', statusCode = 200, expiresIn) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      tokenInfo: {
        expiresIn,
      },
    },
  });
}

// Respuesta al verificar el token (incluir usuario + expiración)
function tokenVerificationResponse(res, message = 'Token verificado exitosamente', statusCode = 200, user, expiresIn) {
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
  tokenRefreshResponse,
  tokenVerificationResponse
};