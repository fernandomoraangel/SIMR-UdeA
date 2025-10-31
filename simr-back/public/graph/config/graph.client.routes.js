"use strict";

// Configurar las rutas del módulo graph
angular.module("graph").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider.when("/graph", {
      templateUrl: "graph/views/graph.client.view.html",
      controller: "GraphController",
      controllerAs: "vm",
    });
  },
]);
