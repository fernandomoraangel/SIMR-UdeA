
angular.module("authentication").factory("Authentication", [
  '$http',
  '$q',
  '$interval',
  '$window',
  function ($http, $q, $interval, $window) {
    const API_URL = 'http://localhost:3000/api/auth';

    const state = {
      currentUser: null,
      isAuthenticated: false,
      sessionExpiration: 0
    };

    let refreshTimer = null;

    function setUser(user, expiresIn) {
      state.currentUser = user || null;
      state.isAuthenticated = !!user;
      state.sessionExpiration = expiresIn || 0;

      if (state.isAuthenticated && state.sessionExpiration) {
        startRefreshTimer(state.sessionExpiration);
      } else {
        stopRefreshTimer();
      }
    }

    function clearUser() {
      setUser(null, 0);
    }

    function startRefreshTimer(expiresIn) {
      const refreshBefore = 60; // Renovar 60s antes de expirar
      // const intervalMs = (expiresIn - refreshBefore) * 1000;
      const intervalMs = Math.max((expiresIn - refreshBefore) * 1000, 5000);

      if (refreshTimer) {
        $interval.cancel(refreshTimer);
      }

      refreshTimer = $interval(refreshToken, intervalMs);
    }

    function stopRefreshTimer() {
      if (refreshTimer) {
        $interval.cancel(refreshTimer);
        refreshTimer = null;
      }
    }

    function refreshToken() {
      return $http.post(`${API_URL}/refresh`, {})
        .then((res) => {
          const tokenInfo = res.data?.data?.tokenInfo;
          if (res.data.success && tokenInfo?.expiresIn) {
            console.log('[Auth] Token renovado');
            startRefreshTimer(tokenInfo.expiresIn);
            return res.data;
          } else {
            clearUser();
            return $q.reject('Error al renovar token');
          }
        })
        .catch((err) => {
          clearUser();
          return $q.reject(err);
        });
    }

    function checkAuthStatus() {
      return $http.get(`${API_URL}/verify`)
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
          clearUser();
          return $q.reject(err);
        });
    }

    function signup(userData) {
      return $http.post(`${API_URL}/signup`, userData)
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
      return $http.post(`${API_URL}/login`, credentials)
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
      return $http.post(`${API_URL}/logout`, {})
        .finally(() => {
          clearUser();
          redirectToAngularApp();
        });
    }

    function redirectToAngularApp() {
      console.log('[Auth] Redirigiendo a la aplicación Angular');
      $window.location.href = '/'; // Cambia si necesitas otra ruta
    }

    function init() {
      return checkAuthStatus()
        .then((user) => {
          console.log('[Auth] Usuario autenticado al iniciar:', user);
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
      refreshToken
    };

    // return {
    //   state, // ← Objeto que siempre refleja el estado actual
    //   init,
    //   checkAuthStatus,
    //   signup,
    //   login,
    //   logout,
    //   refreshToken,
    //   startRefreshTimer,
    //   stopRefreshTimer,
    //   isAuthenticated: () => isAuthenticated,
    //   getCurrentUser: () => currentUser || {}
    // };

  }
]);
