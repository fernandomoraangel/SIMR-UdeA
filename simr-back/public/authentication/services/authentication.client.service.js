angular.module('authentication').factory('Authentication', [
  '$http',
  '$q',
  '$interval',
  '$window',
  function ($http, $q, $interval, $window) {
    const API_URL = 'http://localhost:3000/api/auth';

    const state = {
      currentUser: null,
      isAuthenticated: false,
      sessionExpiration: 0, // Expiración del token en segundos
      tokenExpireTime: 0, // Timestamp cuando expira el token
    };

    let refreshTimer = null;
    let isRefreshing = false; // Flag para evitar múltiples intentos de refresh simultáneos

    function setUser(user, expiresIn) {
      console.log(
        '%c[Auth - setUser()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      state.currentUser = user || null;
      state.isAuthenticated = !!user;
      state.sessionExpiration = expiresIn || 0;

      // Calcular el timestamp exacto de expiración
      if (state.isAuthenticated && state.sessionExpiration) {
        state.tokenExpireTime = Date.now() + state.sessionExpiration * 1000;
        console.log(
          '[Auth] Token expirará en:',
          new Date(state.tokenExpireTime).toLocaleString()
        );
        startRefreshTimer(state.sessionExpiration);
      } else {
        state.tokenExpireTime = 0;
        stopRefreshTimer();
      }
    }

    function clearUser() {
      console.log(
        '%c[Auth - clearUser()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      setUser(null, 0);
      isRefreshing = false;
    }

    function isTokenExpired() {
      if (!state.tokenExpireTime) return true;
      return Date.now() >= state.tokenExpireTime;
    }

    function startRefreshTimer(expiresIn) {
      console.log(
        '%c[Auth - startRefreshTimer()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      const refreshBefore = 60; // Renovar 60s antes de expirar
      const intervalMs = Math.max((expiresIn - refreshBefore) * 1000, 5000);
      // const intervalMs = (expiresIn - refreshBefore) * 1000;
      // const intervalMs = 15 * 1000;
      console.log(
        '[Auth] Configurando temporizador de renovación:',
        intervalMs,
        'ms'
      );
      if (refreshTimer) {
        $interval.cancel(refreshTimer);
      }

      refreshTimer = $interval(() => {
        if (!isRefreshing) {
          refreshToken();
        }
      }, intervalMs);
    }

    function stopRefreshTimer() {
      console.log(
        '%c[Auth - stopRefreshTimer()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      if (refreshTimer) {
        $interval.cancel(refreshTimer);
        refreshTimer = null;
      }
    }

    function refreshToken() {
      console.log(
        '%c[Auth - refreshToken()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );

      if (isRefreshing) {
        console.log('[Auth] Ya hay un refresh en progreso');
        return $q.resolve();
      }

      isRefreshing = true;
      console.log('[Auth] Intentando renovar token...');

      return $http
        .post(`${API_URL}/refresh`, {})
        .then((res) => {
          const data = res.data?.data || {};
          const tokenInfo = data.tokenInfo;
          if (res.data.success && tokenInfo?.expiresIn) {
            console.log('[Auth] Token renovado exitosamente');
            setUser(data.user, tokenInfo.expiresIn);
            // setUser(state.currentUser, tokenInfo.expiresIn);
            return res.data;
          } else {
            console.warn('[Auth] Error en la respuesta del refresh');
            clearUser();
            return $q.reject('Error al renovar token');
          }
        })
        .catch((err) => {
          console.error('[Auth] Error al renovar token:', err);
          clearUser();
          return $q.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    function checkAuthStatus() {
      console.log(
        '%c[Auth - checkAuthStatus()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      console.log(
        '%c[Auth] Verificando estado de autenticación...',
        'color: green; font-weight: bold;'
      );

      return $http
        .get(`${API_URL}/verify`)
        .then((res) => {
          const data = res.data?.data || {};
          if (res.data.success && data.user) {
            setUser(data.user, data.tokenInfo?.expiresIn);
            return state.currentUser;
          } else {
            clearUser();
            return $q.reject('No autenticado');
          }
        })
        .catch((err) => {
          console.log('[Auth] Token expirado al iniciar, renovando...');
          return refreshToken()
            .then(() => {
              console.log(
                '[Auth] Token renovado, usuario verificado:',
                state.currentUser
              );
              return state.currentUser;
            })
            .catch((err) => {
              console.error('[Auth] Error al renovar token:', err);
              clearUser();
              return $q.reject('No se pudo verificar autenticación');
            });
        });
    }

    // Función para verificar y renovar token si es necesario
    function ensureValidToken() {
      if (!state.isAuthenticated) {
        return $q.reject('No autenticado');
      }

      if (isTokenExpired()) {
        console.log('[Auth] Token expirado, intentando renovar...');
        return refreshToken();
      }

      return $q.resolve();
    }

    function signup(userData) {
      return $http
        .post(`${API_URL}/signup`, userData)
        .then((res) => {
          const data = res.data?.data || {};
          if (res.data.success && data.user) {
            setUser(data.user, data.tokenInfo?.expiresIn);
            return state.currentUser;
          }
          clearUser();
          return $q.reject('Error al registrarse');
        })
        .catch((err) => {
          clearUser();
          return $q.reject(err);
        });
    }

    function login(credentials) {
      return $http
        .post(`${API_URL}/login`, credentials)
        .then((res) => {
          const data = res.data?.data || {};
          if (res.data.success && data.user) {
            setUser(data.user, data.tokenInfo?.expiresIn);
            return state.currentUser;
          }
          clearUser();
          return $q.reject('Error al iniciar sesión');
        })
        .catch((err) => {
          clearUser();
          return $q.reject(err);
        });
    }

    function logout() {
      console.log(
        '%c[Auth - logout()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      return $http.post(`${API_URL}/logout`, {}).finally(() => {
        clearUser();
        redirectToAngularApp();
      });
    }

    function redirectToAngularApp() {
      console.log(
        '%c[Auth - redirectToAngularApp()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      $window.location.href = '/';
      // $window.location.href = "http://localhost:4200";
    }

    function init() {
      console.log(
        '%c[Auth - Init()]',
        'color: white; background: blue; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
      );
      console.log('[Auth] Inicializando servicio de autenticación');

      // Verificar estado inicial
      return checkAuthStatus()
        .then((user) => {
          console.log('[Auth - Init] Usuario autenticado al iniciar:', user);
        })
        .catch(() => {
          console.warn('[Auth] No autenticado al iniciar');
        });
    }

    return {
      state, // Objeto que siempre refleja el estado actual
      init,
      checkAuthStatus,
      signup,
      login,
      logout,
      refreshToken,
      ensureValidToken, // Nueva función para asegurar token válido
      isTokenExpired, // Nueva función para verificar expiración
    };
  },
]);
