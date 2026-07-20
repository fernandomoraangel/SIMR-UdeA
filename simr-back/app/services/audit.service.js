"use strict";

const mongoose = require("mongoose");
const AuditLog = mongoose.model("AuditLog");

/**
 * Registra un evento de auditoría.
 * @param {Object} req - Request de Express (para extraer ip, userAgent, user).
 * @param {String} action - Acción realizada (ej. "user_deleted", "role_updated").
 * @param {String} targetType - Tipo de objeto afectado (ej. "user", "role").
 * @param {String|ObjectId} targetId - ID del objeto afectado.
 * @param {Object} changes - Detalle opcional de los cambios.
 */
const logAudit = async (req, action, targetType, targetId, changes) => {
  try {
    if (!req) return;

    const auditData = {
      action,
      ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || "unknown",
      userAgent: (req.get && req.get("User-Agent")) || "unknown",
      success: true,
    };

    if (req.user && req.user._id) {
      auditData.performedBy = req.user._id;
    }

    if (targetType) {
      if (targetType === "user") {
        auditData.targetUser = targetId;
      } else if (targetType === "role") {
        auditData.targetRole = targetId;
      } else {
        auditData.targetType = targetType;
        auditData.targetId = targetId;
      }
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
