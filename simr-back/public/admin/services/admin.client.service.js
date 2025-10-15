"use strict";

angular.module("admin").factory("AdminService", [
  "$http",
  "$q",
  function ($http, $q) {
    const API_URL = "/api";

    return {
      // Usuarios
      getAllUsers: function () {
        return $http
          .get(`${API_URL}/users`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      getUserById: function (userId) {
        return $http
          .get(`${API_URL}/users/${userId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      createUser: function (userData) {
        return $http
          .post(`${API_URL}/auth/signup`, userData)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      updateUser: function (userId, userData) {
        return $http
          .put(`${API_URL}/users/${userId}`, userData)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      deleteUser: function (userId) {
        return $http
          .delete(`${API_URL}/users/${userId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      // Roles de usuario
      assignRole: function (userId, roleId) {
        return $http
          .post(`${API_URL}/users/${userId}/roles/${roleId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      removeRole: function (userId, roleId) {
        return $http
          .delete(`${API_URL}/users/${userId}/roles/${roleId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      updateUserRoles: function (userId, roleIds) {
        return $http
          .put(`${API_URL}/users/${userId}/roles`, { roles: roleIds })
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      // Roles del sistema
      getAllRoles: function () {
        return $http
          .get(`${API_URL}/roles`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      getRoleById: function (roleId) {
        return $http
          .get(`${API_URL}/roles/${roleId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      createRole: function (roleData) {
        return $http
          .post(`${API_URL}/roles`, roleData)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      updateRole: function (roleId, roleData) {
        return $http
          .put(`${API_URL}/roles/${roleId}`, roleData)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      deleteRole: function (roleId) {
        return $http
          .delete(`${API_URL}/roles/${roleId}`)
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },

      // Permisos personalizados
      updateUserPermissions: function (userId, permissions) {
        return $http
          .put(`${API_URL}/users/${userId}/permissions`, {
            permissions: permissions,
          })
          .then((res) => res.data)
          .catch((err) => $q.reject(err));
      },
    };
  },
]);
