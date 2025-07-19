'use strict'

angular.module("users")
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login-externo', {
        template: '<h3>Procesando sesión externa...</h3>',
        controller: 'LoginExternoController'
      })
      .when('/dashboard', {
        // template: '<h1>Bienvenido, {{usuario.nombre}}</h1>',
        template: '<h1>Bienvenidos</h1>',
        controller: 'DashboardController'
      })
      .otherwise({
        redirectTo: '/dashboard2'
      });
  });
