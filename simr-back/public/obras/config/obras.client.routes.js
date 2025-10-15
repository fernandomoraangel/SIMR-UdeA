"use strict";
//Configuración de rutas para 'obras'
angular.module("obras").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/obras", {
        templateUrl: "obras/views/list-obra.client.view.html",
        permission: "list",
        resource: "obras",
      })
      .when("/obras/create", {
        templateUrl: "obras/views/create-obra.client.view.html",
        permission: "create",
        resource: "obras",
      })
      .when("/obras/:obraId", {
        templateUrl: "obras/views/view-obra.client.view.html",
        permission: "read",
        resource: "obras",
      })
      .when("/obras/:obraId/edit", {
        templateUrl: "obras/views/edit-obra.client.view.html",
        permission: "edit",
        resource: "obras",
      });
    /*  .otherwise({
        redirectTo: "/signin",
      }); */
  },
]);
