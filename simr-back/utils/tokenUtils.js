const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (userId) => {
  const jti = crypto.randomUUID();

  const accessToken = jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: Number(process.env.JWT_EXPIRATION) }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh', jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION) }
  );

  return { accessToken, refreshToken, jti };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    console.log('(getTokenExpiration) Expiration date for token: ', decoded);
    console.log('Date now: ', new Date());
    return new Date(decoded.exp * 1000); // Convertir a milisegundos
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiration
};