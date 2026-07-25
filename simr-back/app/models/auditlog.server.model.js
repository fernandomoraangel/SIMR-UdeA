/**
 * Modelo de Auditoría para el Sistema de Roles y Permisos de SIMR
 *
 * Registra todas las operaciones relacionadas con roles y permisos:
 * - Creación, modificación y eliminación de roles
 * - Asignación y remoción de roles a usuarios
 * - Cambios en permisos
 */

"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        // Roles y permisos
        "role_created",
        "role_updated",
        "role_deleted",
        "role_assigned",
        "role_removed",
        "permission_added",
        "permission_removed",
        "permission_updated",
        // Usuarios
        "user_created",
        "user_updated",
        "user_deleted",
        "user_role_assigned",
        "user_role_removed",
        // Obras
        "obra_created",
        "obra_updated",
        "obra_deleted",
        // Actores
        "actor_created",
        "actor_updated",
        "actor_deleted",
        // Recursos
        "recurso_created",
        "recurso_updated",
        "recurso_deleted",
        // Instrumentos
        "instrumento_created",
        "instrumento_updated",
        "instrumento_deleted",
        // Sistemas
        "sistema_created",
        "sistema_updated",
        "sistema_deleted",
        // Medios
        "medio_created",
        "medio_updated",
        "medio_deleted",
        // Géneros musicales
        "genero_created",
        "genero_updated",
        "genero_deleted",
        // Géneros no musicales
        "genero_nomusical_created",
        "genero_nomusical_updated",
        "genero_nomusical_deleted",
        // Materias
        "materia_created",
        "materia_updated",
        "materia_deleted",
        // Fondos
        "fondo_created",
        "fondo_updated",
        "fondo_deleted",
        // Colecciones
        "coleccion_created",
        "coleccion_updated",
        "coleccion_deleted",
        // Proyectos
        "proyecto_created",
        "proyecto_updated",
        "proyecto_deleted",
        // Idiomas
        "idioma_created",
        "idioma_updated",
        "idioma_deleted",
        // Diccionarios
        "diccionario_created",
        "diccionario_updated",
        "diccionario_deleted",
        // Ejemplares
        "ejemplar_created",
        "ejemplar_updated",
        "ejemplar_deleted",
        // Soporte tickets
        "ticket_created",
        "ticket_updated",
        "ticket_deleted",
        "ticket_response_added",
        // Usos
        "uso_created",
        "uso_updated",
        "uso_deleted",
        // Listas de referencia
        "lista_created",
        "lista_updated",
        "lista_deleted",
        "lista_element_added",
        "lista_element_updated",
        "lista_element_deleted",
        // Nube de archivos
        "archivo_uploaded",
        "archivo_deleted",
        // Reemplazo masivo en BD
        "db_replace",
        // Otros
        "login",
        "logout",
      ],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    targetRole: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    targetType: {
      type: String,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: "targetType",
    },
    changes: {
      type: Schema.Types.Mixed, // Almacena el objeto completo de cambios
    },
    previousState: {
      type: Schema.Types.Mixed, // Estado anterior del objeto modificado
    },
    newState: {
      type: Schema.Types.Mixed, // Nuevo estado del objeto modificado
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automáticamente agrega createdAt y updatedAt
  }
);

// Índices para optimizar consultas
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ targetUser: 1, createdAt: -1 });
AuditLogSchema.index({ targetRole: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

/**
 * Método estático: Obtener logs de un usuario específico
 * @param {ObjectId} userId - ID del usuario
 * @param {Number} limit - Límite de registros (default: 50)
 * @returns {Promise<Array>} Array de logs
 */
AuditLogSchema.statics.getUserLogs = function (userId, limit = 50) {
  return this.find({
    $or: [{ performedBy: userId }, { targetUser: userId }],
  })
    .populate("performedBy", "firstName lastName email")
    .populate("targetUser", "firstName lastName email")
    .populate("targetRole", "name description")
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Método estático: Obtener logs de un rol específico
 * @param {ObjectId} roleId - ID del rol
 * @param {Number} limit - Límite de registros (default: 50)
 * @returns {Promise<Array>} Array de logs
 */
AuditLogSchema.statics.getRoleLogs = function (roleId, limit = 50) {
  return this.find({ targetRole: roleId })
    .populate("performedBy", "firstName lastName email")
    .populate("targetUser", "firstName lastName email")
    .populate("targetRole", "name description")
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Método estático: Obtener logs por tipo de acción
 * @param {String} action - Tipo de acción
 * @param {Number} limit - Límite de registros (default: 50)
 * @returns {Promise<Array>} Array de logs
 */
AuditLogSchema.statics.getActionLogs = function (action, limit = 50) {
  return this.find({ action })
    .populate("performedBy", "firstName lastName email")
    .populate("targetUser", "firstName lastName email")
    .populate("targetRole", "name description")
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Método estático: Limpiar logs antiguos
 * @param {Number} daysToKeep - Días a mantener (default: 90)
 * @returns {Promise<Object>} Resultado de la eliminación
 */
AuditLogSchema.statics.cleanOldLogs = function (daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
  }).exec();
};

/**
 * Método estático: Obtener estadísticas de auditoría
 * @returns {Promise<Object>} Estadísticas
 */
AuditLogSchema.statics.getStats = async function () {
  const totalLogs = await this.countDocuments();

  // Logs por acción
  const byAction = await this.aggregate([
    { $group: { _id: "$action", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Logs por rol (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const byRole = await this.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$targetRole", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Actividad reciente (últimos 10)
  const recentActivity = await this.find()
    .populate("performedBy", "firstName lastName email")
    .populate("targetUser", "firstName lastName email")
    .populate("targetRole", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();

  return {
    totalLogs,
    byAction: byAction.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byRole: byRole.reduce((acc, item) => {
      if (item._id) acc[item._id.toString()] = item.count;
      return acc;
    }, {}),
    recentActivity,
  };
};

mongoose.model("AuditLog", AuditLogSchema);
