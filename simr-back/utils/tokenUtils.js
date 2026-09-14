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

// Token efímero para el flujo de 2FA (valida únicamente paso "usuario+password").
// Debe usarse exclusivamente en /api/auth/2fa/verify y expira en pocos minutos.
const TWO_FACTOR_PENDING_COOKIE = 'pending2fa';

const generatePending2faToken = (userId) => {
  const expiresSec = parseInt(
    process.env.TWO_FACTOR_PENDING_EXPIRATION || '300',
    10
  ); // 5 minutos por defecto
  const token = jwt.sign(
    { id: userId, type: 'pending2fa' },
    process.env.JWT_SECRET,
    { expiresIn: expiresSec }
  );
  return { token, expiresSec };
};

const verifyPending2faToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded && decoded.type === 'pending2fa' ? decoded : null;
  } catch (error) {
    return null;
  }
};

const getTokenExpirationDate = (token) => {
  try {
    const decoded = jwt.decode(token);
    // console.log('(getTokenExpiration) Expiration date for token: ', decoded);
    // console.log('Date now: ', new Date());

    // Expiration date
    return new Date(decoded.exp * 1000); // Convertir 'exp' a milisegundos
  } catch (error) {
    return null;
  }
};

const getTokenExpirationInSeconds = (token) => {
  try {
    const decoded = jwt.decode(token);
    console.log(
      '(getTokenExpirationInSeconds) Expiration in seconds for token: ',
      decoded.exp
    );

    // Expiration in seconds
    return decoded.exp - Math.floor(Date.now() / 1000);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpirationDate,
  getTokenExpirationInSeconds,
  generatePending2faToken,
  verifyPending2faToken,
  TWO_FACTOR_PENDING_COOKIE,
};
