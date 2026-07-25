"use strict";

const mongoose = require("mongoose");
const AuditLog = mongoose.model("AuditLog");

/**
 * Registra un evento de auditoría de forma genérica para cualquier entidad.
 * @param {Object} req - Request de Express (para extraer ip, userAgent, user).
 * @param {String} action - Acción realizada (ej. "obra_created", "actor_deleted").
 * @param {String} targetType - Tipo de objeto afectado (ej. "obra", "actor", "recurso").
 * @param {String|ObjectId} targetId - ID del objeto afectado.
 * @param {Object} targetName - Nombre descriptivo del objeto afectado (opcional).
 * @param {Object} changes - Detalle opcional de los cambios.
 */
const logAudit = async (req, action, targetType, targetId, targetName, changes) => {
  try {
    if (!req) return;

    const auditData = {
      action,
      targetType,
      targetId,
      targetName: targetName || null,
      ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || "unknown",
      userAgent: (req.get && req.get("User-Agent")) || "unknown",
      success: true,
    };

    if (req.user && req.user._id) {
      auditData.performedBy = req.user._id;
    }

    if (changes) {
      auditData.changes = changes;
    }

    await AuditLog.create(auditData);
  } catch (error) {
    console.error("Error al crear log de auditoría:", error);
    if (changes) {
      console.error("Cambios que causaron el error:", JSON.stringify(changes));
    }
  }
};

module.exports = { logAudit };
