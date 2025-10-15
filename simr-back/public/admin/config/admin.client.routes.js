"use strict";

angular.module("admin").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/admin/usuarios", {
        templateUrl: "/admin/views/usuarios-lista.client.view.html",
        controller: "UsuariosListaController",
        permission: "admin",
        resource: "usuarios",
      })
      .when("/admin/usuarios/crear", {
        templateUrl: "/admin/views/usuarios-form.client.view.html",
        controller: "UsuariosFormController",
        permission: "admin",
        resource: "usuarios",
      })
      .when("/admin/usuarios/:userId/editar", {
        templateUrl: "/admin/views/usuarios-form.client.view.html",
        controller: "UsuariosFormController",
        permission: "admin",
        resource: "usuarios",
      })
      .when("/admin/roles", {
        templateUrl: "/admin/views/roles-lista.client.view.html",
        controller: "RolesListaController",
        permission: "admin",
        resource: "roles",
      })
      .when("/admin/roles/crear", {
        templateUrl: "/admin/views/roles-form.client.view.html",
        controller: "RolesFormController",
        permission: "admin",
        resource: "roles",
      })
      .when("/admin/roles/:roleId/editar", {
        templateUrl: "/admin/views/roles-form.client.view.html",
        controller: "RolesFormController",
        permission: "admin",
        resource: "roles",
      });
  },
]);
