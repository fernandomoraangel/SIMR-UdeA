// Constantes de configuración
const COOKIE_ACCESS_MAX_AGE = parseInt(process.env.JWT_EXPIRATION) * 1000; // Convertir a milisegundos
const COOKIE_REFRESH_MAX_AGE =
  parseInt(process.env.JWT_REFRESH_EXPIRATION) * 1000; // Convertir a milisegundos

// Configuración base de cookies seguras
const baseCookieOptions = {
  httpOnly: true,
  secure: false, // Cambiado a false para desarrollo con HTTP
  sameSite: "lax", // 'lax' permite cookies en navegación normal
  path: "/", // Disponible en toda la app
  // No especificar domain en desarrollo permite usar IPs (172.23.0.97)
  // En producción se puede especificar el dominio mediante variable de entorno
  domain: process.env.COOKIE_DOMAIN || undefined,
};

// Configuración de cookies para autenticación
const cookieConfig = {
  // Configuración específica para access tokens
  accessToken: {
    ...baseCookieOptions,
    maxAge: COOKIE_ACCESS_MAX_AGE,
  },

  // Configuración específica para refresh tokens
  refreshToken: {
    ...baseCookieOptions,
    maxAge: COOKIE_REFRESH_MAX_AGE,
  },

  clear: {
    ...baseCookieOptions,
    // domain: '.midominio.com' // Limpiar en todos los subdominios
  },
};

// Funciones helper para manejar cookies
const cookieHelpers = {
  // Configurar cookies de autenticación
  setAuthCookies: (res, accessToken, refreshToken) => {
    try {
      res.cookie("accessToken", accessToken, cookieConfig.accessToken);
      res.cookie("refreshToken", refreshToken, cookieConfig.refreshToken);
      return true;
    } catch (error) {
      console.error("Error configurando cookies de autenticación:", error);
      return false;
    }
  },

  // Limpiar cookies de autenticación
  clearAuthCookies: (res) => {
    try {
      res.clearCookie("accessToken", cookieConfig.clear);
      res.clearCookie("refreshToken", cookieConfig.clear);
      return true;
    } catch (error) {
      console.error("Error limpiando cookies de autenticación:", error);
      return false;
    }
  },

  // Limpiar una cookie específica
  clearCookie: (res, cookieName) => {
    try {
      res.clearCookie(cookieName, cookieConfig.clear);
      return true;
    } catch (error) {
      console.error(`Error limpiando cookie ${cookieName}:`, error);
      return false;
    }
  },

  // Configurar cookie individual
  setCookie: (res, name, value, customConfig = {}) => {
    try {
      const finalConfig = { ...baseCookieOptions, ...customConfig };
      res.cookie(name, value, finalConfig);
      return true;
    } catch (error) {
      console.error(`Error configurando cookie ${name}:`, error);
      return false;
    }
  },
};

module.exports = {
  cookieConfig,
  cookieHelpers,
};
