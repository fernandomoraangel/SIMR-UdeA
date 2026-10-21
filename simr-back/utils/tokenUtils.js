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
// Debe usarse exclusivamente en los endpoints /api/auth/2fa/* y expira en pocos minutos.
// `purpose` separa ambos flujos para que un token emitido para enrolamiento no
// pueda usarse para verificar un código de login y viceversa:
//   - 'verify' : el usuario ya tiene 2FA y debe introducir su código TOTP.
//   - 'enroll' : el usuario aún no lo tiene y debe darse de alta (obligatorio).
const TWO_FACTOR_PENDING_COOKIE = 'pending2fa';
const TWO_FACTOR_PURPOSE_VERIFY = 'verify';
const TWO_FACTOR_PURPOSE_ENROLL = 'enroll';

const generatePending2faToken = (userId, options = {}) => {
  const {
    purpose = TWO_FACTOR_PURPOSE_VERIFY,
    expiresIn,
  } = options;

  const defaultExpiration =
    purpose === TWO_FACTOR_PURPOSE_ENROLL
      ? process.env.TWO_FACTOR_ENROLLMENT_EXPIRATION || '900' // 15 min para escanear el QR
      : process.env.TWO_FACTOR_PENDING_EXPIRATION || '300'; // 5 min

  const expiresSec = parseInt(expiresIn || defaultExpiration, 10);
  const token = jwt.sign(
    { id: userId, type: 'pending2fa', purpose },
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
  TWO_FACTOR_PURPOSE_VERIFY,
  TWO_FACTOR_PURPOSE_ENROLL,
};
