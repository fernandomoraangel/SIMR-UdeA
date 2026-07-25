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
function buildSort(sortField, sortDir) {
  const field = sortField || 'createdAt';
  const dir = sortDir === 'asc' ? 1 : -1;
  return { [field]: dir };
}

exports.list = async (req, res) => {
  try {
    const { action, userId, roleId, targetType, search, dateFrom, dateTo, sortField, sortDir, limit = 50, skip = 0 } = req.query;

    // Construir filtros
    const filters = [];
    // Filtro por acción: verbos genéricos usan regex para emparejar compuestos
    if (action) {
      if (action === 'create') {
        filters.push({ action: { $regex: '(created|creada|creado|added|uploaded)$', $options: 'i' } });
      } else if (action === 'update') {
        filters.push({ action: { $regex: '(updated|actualizado|modificado|assigned)$', $options: 'i' } });
      } else if (action === 'delete') {
        filters.push({ action: { $regex: '(deleted|eliminado)$', $options: 'i' } });
      } else {
        filters.push({ action });
      }
    }
    if (targetType) filters.push({ targetType });
    if (roleId) filters.push({ targetRole: roleId });

    // Filtro por usuario (ejecutor o usuario objetivo)
    if (userId) {
      filters.push({ $or: [{ performedBy: userId }, { targetUser: userId }] });
    }

    // Filtro por rango de fechas
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    if (Object.keys(dateFilter).length > 0) filters.push({ createdAt: dateFilter });

    // Buscar texto completo en todos los campos texto relevantes
    if (search) {
      const regex = new RegExp(search, 'i');
      filters.push({
        $or: [
          { action: regex },
          { targetType: regex },
          { targetName: regex },
          { 'performedBy.firstName': regex },
          { 'performedBy.lastName': regex },
          { 'targetUser.firstName': regex },
          { 'targetUser.lastName': regex },
        ],
      });
    }

    const filter = filters.length > 0 ? (filters.length === 1 ? filters[0] : { $and: filters }) : {};

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "firstName lastName email")
      .populate("targetUser", "firstName lastName email")
      .populate("targetRole", "name description")
      .sort(buildSort(sortField, sortDir))
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
