
angular.module("authentication").factory("Authentication", [
  '$http',
  '$q',
  '$rootScope',
  '$interval',
  '$window',
  function ($http, $q, $rootScope, $interval, $window) {
    var API_URL = 'http://localhost:3000/api/auth';

    const service = {
      currentUser: null,
      isAuthenticated: false,
      refreshTimer: null,
      sessionExpiration: 0,

      // Verificar si el usuario está autenticado
      checkAuthStatus: function () {
        return $http.get('/api/auth/verify')
          .then(function (response) {
            const data = response.data?.data || {};
            console.log('[Auth] Verificando autenticación:', response);
            if (response.data.success && data.user) {
              service.currentUser = data.user;
              service.isAuthenticated = true;
              service.sessionExpiration = data.tokenInfo?.expiresIn || 0;

              // // Iniciar temporizador si tenemos expiresIn
              // if (service.sessionExpiration) {
              //   service.startRefreshTimer(service.sessionExpiration);
              // }

              $rootScope.$broadcast('auth:loginSuccess', service.currentUser);
              return service.currentUser;
            } else {
              service.clearUser();
              return $q.reject('No autenticado');
            }
          })
          .catch(function (error) {
            service.clearUser();
            return $q.reject(error);
          });
      },

      signup: function (userData) {
        console.log('[Auth] Registrando usuario:', userData);
        return $http.post(`${API_URL}/signup`, userData)
          .then(function (response) {
            const data = response.data?.data || {};
            if (response.data.success && data.user) {
              service.currentUser = data.user;
              service.isAuthenticated = true;
              service.sessionExpiration = data.tokenInfo?.expiresIn || 0;

              // Iniciar temporizador si tenemos expiresIn
              if (service.sessionExpiration) {
                service.startRefreshTimer(service.sessionExpiration);
              }

              $rootScope.$broadcast('auth:signupSuccess', service.currentUser);
              return service.currentUser;
            }
            service.clearUser();
            return $q.reject('Error al registrarse');
          })
          .catch(function (error) {
            service.clearUser();
            return $q.reject(error);
          });
      },

      login: function (credentials) {
        console.log('[Auth] Iniciando sesión con credenciales:', credentials);
        return $http.post(`${API_URL}/login`, credentials)
          .then(function (response) {
            const data = response.data?.data || {};
            if (response.data.success && data.user) {
              service.currentUser = data.user;
              service.isAuthenticated = true;
              service.sessionExpiration = data.tokenInfo?.expiresIn || 0;

              // Iniciar temporizador si tenemos expiresIn
              if (service.sessionExpiration) {
                service.startRefreshTimer(service.sessionExpiration);
              }

              $rootScope.$broadcast('auth:loginSuccess', service.currentUser);
              return service.currentUser;
            }
            service.clearUser();
            return $q.reject('Error al iniciar sesión');
          })
          .catch(function (error) {
            service.clearUser();
            return $q.reject(error);
          });
      },

      // Renovar token
      refreshToken: function () {
        console.log('[Auth] Renovando token...');
        return $http.post('/api/auth/refresh', {})
          .then(function (res) {
            const tokenInfo = res.data?.data?.tokenInfo;
            if (res.data.success && tokenInfo?.expiresIn) {
              console.log('[Auth] Token renovado');
              service.startRefreshTimer(tokenInfo.expiresIn);
              return res.data;
            } else {
              service.clearUser();
              return $q.reject('Error al renovar token');
            }
          })
          .catch(function (err) {
            service.clearUser();
            return $q.reject(err);
          });
      },

      // Temporizador de renovación
      startRefreshTimer: function (expiresIn) {
        console.log('[Auth] Iniciando temporizador. expiresIn:', expiresIn);

        const refreshBefore = 60; // segundos antes del vencimiento
        const intervalMs = (expiresIn - refreshBefore) * 1000;
        // const intervalMs = 5 * 1000; // 10 segundos para pruebas

        if (service.refreshTimer) {
          $interval.cancel(service.refreshTimer);
        }

        service.refreshTimer = $interval(() => {
          service.refreshToken();
        }, intervalMs);
      },

      stopRefreshTimer: function () {
        if (service.refreshTimer) {
          $interval.cancel(service.refreshTimer);
          service.refreshTimer = null;
        }
      },

      // Estado
      isAuthenticatedFn: function () {
        console.log('[Auth - isAuthenticatedFn] Verificando estado de autenticación:', service.isAuthenticated);
        return service.isAuthenticated;
      },

      getCurrentUser: function () {
        return service.currentUser || {};
      },

      clearUser: function () {
        service.currentUser = null;
        service.isAuthenticated = false;
        service.stopRefreshTimer();
        $rootScope.$broadcast('auth:logout');
      },

      // Logout
      logout: function () {
        return $http.post(API_URL + '/logout', {})
          .then(function (response) {
            service.clearUser();
            $rootScope.$broadcast('auth:logoutSuccess');
            return $q.resolve(response.data);
          })
          .catch(function (error) {
            service.clearUser();
            $rootScope.$broadcast('auth:logoutSuccess');
            return $q.reject(error);
          })
          .finally(function () {
            service.redirectToAngularApp();
          });
      },

      // Inicializar autenticación (ideal para ejecutar al arrancar)
      init: function () {
        service.checkAuthStatus()
          .then(function (user) {
            console.log('[Auth] Usuario autenticado al iniciar:', user);
            console.log('[Auth] Session expiration:', service.sessionExpiration);
            // Iniciar temporizador si tenemos expiresIn
            if (service.sessionExpiration) {
              console.log('[Auth] Iniciando temporizador con expiresIn:', service.sessionExpiration);
              service.startRefreshTimer(service.sessionExpiration);
            }
          })
          .catch(function () {
            console.warn('[Auth] No autenticado al iniciar');
            service.clearUser();
          });
      },

      // Redirigir a Angular
      redirectToAngularApp: function () {
        console.log('[Auth] Redirigiendo a la aplicación Angular');
        const angularUrl = 'http://localhost:4200';
        // $window.location.href = angularUrl;
        $window.location.href = '/';
      }
    };

    return {
      init: service.init,
      checkAuthStatus: service.checkAuthStatus,
      getCurrentUser: service.getCurrentUser,
      isAuthenticated: service.isAuthenticatedFn,
      startRefreshTimer: service.startRefreshTimer,
      stopRefreshTimer: service.stopRefreshTimer,
      refreshToken: service.refreshToken,
      signup: service.signup,
      login: service.login,
      logout: service.logout
    };
  }
]);
