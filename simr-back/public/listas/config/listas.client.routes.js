"use strict";
//Configuración de rutas para 'listas'
angular.module("listas").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider.when("/listas", {
      templateUrl: "listas/views/list-listas.client.view.html",
    });
  },
]);
