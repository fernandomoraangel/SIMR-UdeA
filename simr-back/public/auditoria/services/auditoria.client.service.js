"use strict";

angular.module("auditoria").factory("AuditoriaService", [
  "$http",
  function ($http) {
    const apiUrl = "/api/auditlogs";

    return {
      // Listar logs con filtros y paginación
      list: function (params) {
        return $http.get(apiUrl, { params: params });
      },

      // Obtener estadísticas
      getStats: function (days) {
        return $http.get(`${apiUrl}/stats`, { params: { days: days || 30 } });
      },

      // Obtener logs de un usuario
      getUserLogs: function (userId, limit) {
        return $http.get(`${apiUrl}/user/${userId}`, {
          params: { limit: limit || 50 },
        });
      },

      // Obtener logs de un rol
      getRoleLogs: function (roleId, limit) {
        return $http.get(`${apiUrl}/role/${roleId}`, {
          params: { limit: limit || 50 },
        });
      },

      // Obtener logs por acción
      getActionLogs: function (action, limit) {
        return $http.get(`${apiUrl}/action/${action}`, {
          params: { limit: limit || 50 },
        });
      },

      // Limpiar logs antiguos
      cleanOldLogs: function (daysToKeep) {
        return $http.post(`${apiUrl}/clean`, { daysToKeep: daysToKeep || 90 });
      },
    };
  },
]);
