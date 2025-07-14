angular.module("users").factory("Authentication", [
  '$http',
  '$q',
  '$rootScope',
  '$interval',
  '$window',
  function ($http, $q, $rootScope, $interval, $window) {
    var API_URL = 'http://localhost:3000/api/auth';
    // var API_URL = '/api/auth';

    // Configuración por defecto para incluir cookies
    // $http.defaults.withCredentials = true;

    const service = {
      currentUser: null,
      isAuthenticated: false,
      refreshTimer: null,
    };

    // Verificar si el usuario está autenticado con token en cookies
    service.checkAuthStatus = function () {
      return $http.get('/api/auth/verify') // usa cookies httpOnly
        .then(function (response) {
          if (response.data.success && response.data.data.user) {
            service.currentUser = response.data.data.user;
            service.isAuthenticated = true;
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
    };

    // Limpiar el estado de autenticación
    service.clearUser = function () {
      service.currentUser = null;
      service.isAuthenticated = false;
      $rootScope.$broadcast('auth:logout');
    };

    // Obtener el usuario actual
    service.getCurrentUser = function () {
      return service.currentUser || {};
    };

    // Saber si está autenticado
    service.isAuthenticatedFn = function () {
      // console.log("isAuthenticatedFn called:", service.isAuthenticated);
      return service.isAuthenticated;
    };

    // Intentar renovar token automáticamente
    service.refreshToken = function () {
      console.log('Renovando token de acceso...');
      return $http.post('/api/auth/refresh', {})
        .then(function (res) {
          console.log('(service.refreshToken()) res:', res);
          console.log('res.data.success:', res.data.success);
          if (res.data.success) {
            console.log('Access token renovado');
            if (res.data.data.tokens.expiresIn) {
              // Reajustar el temporizador si el backend da info
              service.startRefreshTimer(res.data.data.tokens.expiresIn);
            }
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
    };

    service.startRefreshTimer = function (expiresIn) {
      console.log('Iniciando temporizador de renovación de token');
      // Renovar token un poco antes de que expire
      const refreshBeforeInSeconds = 60; // 1 minuto antes de expirar
      const intervalMs = (expiresIn - refreshBeforeInSeconds) * 1000; // Convertir a milisegundos
      if (service.refreshTimer) {
        $interval.cancel(service.refreshTimer);
      }
      service.refreshTimer = $interval(function () {
        console.log('Intentando renovar token...');
        service.refreshToken();
      }, intervalMs);
    };

    service.stopRefreshTimer = function () {
      if (service.refreshTimer) {
        $interval.cancel(service.refreshTimer);
        service.refreshTimer = null;
      }
    };

    // Login (generalmente no se usará en AngularJS ya que se hace desde Angular)
    service.login = function (username, password) {
      return $http.post(API_URL + '/login', {
        username: username,
        password: password
      })
        .then(function (response) {
          if (response.data.success && response.data.user) {
            service.currentUser = response.data.user;
            service.isAuthenticated = true;
            $rootScope.$broadcast('auth:loginSuccess', service.currentUser);
            return $q.resolve(response.data);
          } else {
            return $q.reject(response.data.message || 'Error de login');
          }
        })
        .catch(function (error) {
          return $q.reject(error.data?.message || 'Error de conexión');
        });
    };

    // Logout
    service.logout = function () {
      return $http.post(API_URL + '/logout', {})
        .then(function (response) {
          service.clearUser();
          $rootScope.$broadcast('auth:logoutSuccess');
          // return response.data; // Respuesta del servidor
          return $q.resolve(response.data);
        })
        .catch(function (error) {
          // Aunque falle el logout en servidor, limpiar localmente
          service.clearUser();
          $rootScope.$broadcast('auth:logoutSuccess');
          return $q.reject(error);
        })
        .finally(function () {
          // Detener el temporizador de renovación
          service.stopRefreshTimer();
          service.redirectToAngularApp();
        });
    };

    // Redirigir a aplicación Angular
    service.redirectToAngularApp = function () {
      var angularAppUrl = 'http://localhost:4200'; // Ajusta según tu configuración
      $window.location.href = angularAppUrl;
    };

    return {
      checkAuthStatus: service.checkAuthStatus,
      getCurrentUser: service.getCurrentUser,
      isAuthenticated: service.isAuthenticatedFn,
      startRefreshTimer: service.startRefreshTimer,
      stopRefreshTimer: service.stopRefreshTimer,
      refreshToken: service.refreshToken,
      logout: service.logout
    };
  }
]);
