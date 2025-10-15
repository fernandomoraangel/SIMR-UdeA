"use strict";

angular.module("auditoria").controller("AuditoriaListaController", [
  "$scope",
  "AuditoriaService",
  function ($scope, AuditoriaService) {
    // Inicialización
    $scope.logs = [];
    $scope.loading = false;
    $scope.pagination = {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0,
    };

    // Filtros
    $scope.filters = {
      action: "",
      startDate: "",
      endDate: "",
      success: "",
    };

    // Opciones de acciones para el filtro
    $scope.actions = [
      { value: "role_created", label: "Rol Creado" },
      { value: "role_updated", label: "Rol Actualizado" },
      { value: "role_deleted", label: "Rol Eliminado" },
      { value: "role_assigned", label: "Rol Asignado" },
      { value: "role_removed", label: "Rol Removido" },
      { value: "permission_added", label: "Permiso Agregado" },
      { value: "permission_removed", label: "Permiso Removido" },
      { value: "permission_updated", label: "Permiso Actualizado" },
    ];

    // Cargar logs
    $scope.loadLogs = function () {
      $scope.loading = true;

      const params = {
        page: $scope.pagination.page,
        limit: $scope.pagination.limit,
      };

      // Agregar filtros si están definidos
      if ($scope.filters.action) params.action = $scope.filters.action;
      if ($scope.filters.startDate) params.startDate = $scope.filters.startDate;
      if ($scope.filters.endDate) params.endDate = $scope.filters.endDate;
      if ($scope.filters.success !== "")
        params.success = $scope.filters.success;

      AuditoriaService.list(params)
        .then(function (response) {
          if (response.data.success) {
            $scope.logs = response.data.data.logs;
            $scope.pagination = response.data.data.pagination;
          } else {
            Swal.fire({
              title: "Error",
              text: response.data.message || "No se pudieron cargar los logs",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
        })
        .catch(function (error) {
          console.error("Error al cargar logs:", error);
          Swal.fire({
            title: "Error",
            text: "Error al cargar los logs de auditoría",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Aplicar filtros
    $scope.applyFilters = function () {
      $scope.pagination.page = 1; // Reiniciar a la primera página
      $scope.loadLogs();
    };

    // Limpiar filtros
    $scope.clearFilters = function () {
      $scope.filters = {
        action: "",
        startDate: "",
        endDate: "",
        success: "",
      };
      $scope.pagination.page = 1;
      $scope.loadLogs();
    };

    // Paginación
    $scope.nextPage = function () {
      if ($scope.pagination.page < $scope.pagination.pages) {
        $scope.pagination.page++;
        $scope.loadLogs();
      }
    };

    $scope.prevPage = function () {
      if ($scope.pagination.page > 1) {
        $scope.pagination.page--;
        $scope.loadLogs();
      }
    };

    $scope.goToPage = function (page) {
      if (page >= 1 && page <= $scope.pagination.pages) {
        $scope.pagination.page = page;
        $scope.loadLogs();
      }
    };

    // Formatear fecha
    $scope.formatDate = function (dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    // Obtener etiqueta de acción
    $scope.getActionLabel = function (action) {
      const actionObj = $scope.actions.find((a) => a.value === action);
      return actionObj ? actionObj.label : action;
    };

    // Obtener clase de badge según el tipo de acción
    $scope.getActionClass = function (action) {
      const classes = {
        role_created: "label-success",
        role_updated: "label-info",
        role_deleted: "label-danger",
        role_assigned: "label-primary",
        role_removed: "label-warning",
        permission_added: "label-success",
        permission_removed: "label-danger",
        permission_updated: "label-info",
      };
      return classes[action] || "label-default";
    };

    // Ver detalles del log
    $scope.viewDetails = function (log) {
      let html = '<div style="text-align: left;">';
      html +=
        "<p><strong>Acción:</strong> " +
        $scope.getActionLabel(log.action) +
        "</p>";
      html +=
        "<p><strong>Realizado por:</strong> " +
        (log.performedBy
          ? log.performedBy.firstName + " " + log.performedBy.lastName
          : "Sistema") +
        "</p>";
      html +=
        "<p><strong>Fecha:</strong> " +
        $scope.formatDate(log.createdAt) +
        "</p>";

      if (log.targetUser) {
        html +=
          "<p><strong>Usuario afectado:</strong> " +
          log.targetUser.firstName +
          " " +
          log.targetUser.lastName +
          "</p>";
      }

      if (log.targetRole) {
        html +=
          "<p><strong>Rol afectado:</strong> " + log.targetRole.name + "</p>";
      }

      if (log.ipAddress) {
        html += "<p><strong>IP:</strong> " + log.ipAddress + "</p>";
      }

      if (log.errorMessage) {
        html +=
          '<p><strong>Error:</strong> <span style="color: red;">' +
          log.errorMessage +
          "</span></p>";
      }

      html += "</div>";

      Swal.fire({
        title: "Detalles del Log",
        html: html,
        width: "600px",
        confirmButtonText: "Cerrar",
      });
    };

    // Limpiar logs antiguos
    $scope.cleanOldLogs = function () {
      Swal.fire({
        title: "¿Cuántos días mantener?",
        input: "number",
        inputValue: 90,
        inputAttributes: {
          min: 30,
          max: 365,
          step: 1,
        },
        text: "Se eliminarán los logs más antiguos que el número de días especificado",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
      }).then(function (result) {
        if (result.isConfirmed) {
          const daysToKeep = parseInt(result.value);

          AuditoriaService.cleanOldLogs(daysToKeep)
            .then(function (response) {
              if (response.data.success) {
                Swal.fire({
                  title: "¡Éxito!",
                  text: "Logs eliminados: " + response.data.data.deletedCount,
                  icon: "success",
                  confirmButtonText: "Aceptar",
                });
                $scope.loadLogs(); // Recargar lista
              }
            })
            .catch(function (error) {
              Swal.fire({
                title: "Error",
                text: "No se pudieron eliminar los logs antiguos",
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
    };

    // Cargar logs al iniciar
    $scope.loadLogs();
  },
]);
