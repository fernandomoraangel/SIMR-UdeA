/**
 * Controlador de Auditoría para SIMR
 * Maneja consultas de logs de auditoría
 */

"use strict";

const mongoose = require("mongoose");
const AuditLog = mongoose.model("AuditLog");

// Funciones helper para respuestas estandarizadas
const successResponse = (res, message, statusCode = 200, data = null) => {
  const response = { success: true, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 400, details = null) => {
  const response = { success: false, message };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

//* LIST - Listar logs de auditoría con filtros
exports.list = async (req, res) => {
  try {
    const { action, userId, roleId, limit = 50, skip = 0 } = req.query;

    // Construir filtro
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.$or = [{ performedBy: userId }, { targetUser: userId }];
    if (roleId) filter.targetRole = roleId;

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "firstName lastName email")
      .populate("targetUser", "firstName lastName email")
      .populate("targetRole", "name description")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AuditLog.countDocuments(filter);

    successResponse(res, "Logs de auditoría recuperados exitosamente", 200, {
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Error al recuperar logs de auditoría", 500, {
      error: err.message,
    });
  }
};

//* GET USER LOGS - Obtener logs de un usuario específico
exports.getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await AuditLog.getUserLogs(userId, parseInt(limit));

    successResponse(
      res,
      "Logs del usuario recuperados exitosamente",
      200,
      logs
    );
  } catch (err) {
    errorResponse(res, "Error al recuperar logs del usuario", 500, {
      error: err.message,
    });
  }
};

//* GET ROLE LOGS - Obtener logs de un rol específico
exports.getRoleLogs = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await AuditLog.getRoleLogs(roleId, parseInt(limit));

    successResponse(res, "Logs del rol recuperados exitosamente", 200, logs);
  } catch (err) {
    errorResponse(res, "Error al recuperar logs del rol", 500, {
      error: err.message,
    });
  }
};

//* GET ACTION LOGS - Obtener logs por tipo de acción
exports.getActionLogs = async (req, res) => {
  try {
    const { action } = req.params;
    const { limit = 50 } = req.query;

    const logs = await AuditLog.getActionLogs(action, parseInt(limit));

    successResponse(res, "Logs de acción recuperados exitosamente", 200, logs);
  } catch (err) {
    errorResponse(res, "Error al recuperar logs de acción", 500, {
      error: err.message,
    });
  }
};

//* GET STATS - Obtener estadísticas de auditoría
exports.getStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    // Estadísticas por acción
    const actionStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: cutoffDate } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Total de logs
    const totalLogs = await AuditLog.countDocuments({
      createdAt: { $gte: cutoffDate },
    });

    // Usuarios más activos
    const activeUsers = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: cutoffDate } } },
      { $group: { _id: "$performedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          count: 1,
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          email: "$user.email",
        },
      },
    ]);

    successResponse(
      res,
      "Estadísticas de auditoría recuperadas exitosamente",
      200,
      {
        period: {
          days: parseInt(days),
          from: cutoffDate,
          to: new Date(),
        },
        totalLogs,
        actionStats,
        activeUsers,
      }
    );
  } catch (err) {
    errorResponse(res, "Error al recuperar estadísticas", 500, {
      error: err.message,
    });
  }
};

//* CLEAN OLD LOGS - Limpiar logs antiguos (solo admin)
exports.cleanOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const result = await AuditLog.cleanOldLogs(parseInt(daysToKeep));

    successResponse(
      res,
      `Logs antiguos eliminados exitosamente. ${result.deletedCount} registro(s) eliminado(s).`,
      200,
      { deletedCount: result.deletedCount, daysKept: parseInt(daysToKeep) }
    );
  } catch (err) {
    errorResponse(res, "Error al limpiar logs antiguos", 500, {
      error: err.message,
    });
  }
};
