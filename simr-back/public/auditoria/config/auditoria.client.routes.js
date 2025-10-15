"use strict";

angular.module("auditoria").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/admin/auditoria", {
        templateUrl: "/auditoria/views/auditoria-lista.client.view.html",
        controller: "AuditoriaListaController",
        permission: "admin",
        resource: "auditoria",
      })
      .when("/admin/auditoria/stats", {
        templateUrl: "/auditoria/views/auditoria-stats.client.view.html",
        controller: "AuditoriaStatsController",
        permission: "admin",
        resource: "auditoria",
      });
  },
]);
