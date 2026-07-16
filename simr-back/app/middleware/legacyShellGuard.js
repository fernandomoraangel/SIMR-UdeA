// Invocar el modo 'strict' de JavaScript
'use strict';

/**
 * legacyShellGuard.js
 * ------------------------------------------------------------------
 * Middleware de "auth-gating" para el frontend legacy AngularJS.
 *
 * Motivo (ticket de seguridad UdeA, escaneo OWASP ZAP más profundo):
 * el núcleo `angular.js` v1.8.2 (EOL, sin parches oficiales gratuitos)
 * se servía de forma completamente pública y anónima, tanto el shell
 * (`GET /`) como los assets estáticos (`express.static('./public')`),
 * lo cual permitía que un escaneo anónimo (o cualquier visitante no
 * autenticado) descargara y fingerprintee la librería vulnerable.
 *
 * Este middleware NO parchea angular.js (no existe parche oficial
 * gratuito más allá de 1.8.2). En su lugar, reduce la superficie de
 * exposición pública: bloquea el acceso anónimo al shell legacy y a
 * TODOS sus assets estáticos (incluye angular.js, jquery, bootstrap,
 * etc.), redirigiendo a cualquier visitante sin sesión válida hacia el
 * login del frontend moderno (Angular 20, `simr-front`), que es
 * completamente independiente de AngularJS.
 *
 * Reutiliza la misma verificación JWT (passport-jwt, extractor de
 * cookies httpOnly) que ya usa el resto de la aplicación, por lo que
 * cualquier usuario que inicie sesión desde el Angular 20 nuevo (o
 * desde el propio legacy) obtiene automáticamente acceso, sin tocar
 * el mecanismo de sesión existente.
 */

const passport = require('passport');

// Construye la URL del login del frontend moderno (Angular 20), que se
// sirve bajo el sub-path "/angular/" según la configuración de Nginx
// (ver nginx.prod.conf / nginx.dev.conf, location /angular/). "returnTo"
// se mantiene relativo (p.ej. "/") porque tanto simr-front como
// simr-back quedan publicados bajo el mismo host a través de Nginx; el
// propio backend (/redirect-to-legacy) resuelve esa ruta relativa
// contra su origen.
//
// Nota: FRONTEND_URL no es consistente entre entornos (en producción es
// el origen "pelado", p.ej. "https://172.23.0.97"; en desarrollo ya
// incluye el sufijo, p.ej. "http://localhost/angular"). Se normaliza
// aquí para no depender de esa convención.
function buildLoginUrl(req) {
  let frontendBase = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  if (!/\/angular$/.test(frontendBase)) {
    frontendBase = `${frontendBase}/angular`;
  }
  const returnTo = encodeURIComponent(req.originalUrl || '/');
  return `${frontendBase}/login?returnTo=${returnTo}`;
}

const legacyShellGuard = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      console.error('[legacyShellGuard] Error verificando sesión:', err);
    }

    if (!user) {
      return res.redirect(buildLoginUrl(req));
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = legacyShellGuard;
