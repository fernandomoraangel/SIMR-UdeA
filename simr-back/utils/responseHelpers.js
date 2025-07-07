function successResponse(res, message = 'Operación exitosa', data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

function errorResponse(res, message = 'Error interno del servidor', statusCode = 500, data = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...data
  });
}

module.exports = {
  successResponse,
  errorResponse
};