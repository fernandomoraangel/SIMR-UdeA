"use strict";

const mongoose = require("mongoose");
const SupportTicket = mongoose.model("SupportTicket");
const { sendMail } = require("../../config/mailer");

const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      default:
        message = "Se ha producido un error";
    }
  } else {
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

async function notifyTicketCreated(ticket) {
  try {
    await ticket.populate("createdBy", "email fullName username");
    const userEmail = ticket.createdBy?.email;
    if (userEmail) {
      await sendMail({
        to: userEmail,
        subject: `[${ticket.ticketNumber}] Ticket creado - SIMR`,
        html: `
          <h2>Ticket de soporte creado</h2>
          <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Asunto:</strong> ${ticket.subject}</p>
          <p><strong>Descripción:</strong></p>
          <p>${ticket.description}</p>
          <p><strong>Prioridad:</strong> ${ticket.priority}</p>
          <p><strong>Estado:</strong> ${ticket.status}</p>
          <hr />
          <small>SIMR - Universidad de Antioquia</small>
        `,
      });
    }
  } catch (err) {
    console.warn("[soporte] Error al notificar creación:", err.message);
  }
}

async function notifyStatusChange(ticket, oldStatus, changedBy) {
  try {
    await ticket.populate("createdBy", "email fullName username");
    const userEmail = ticket.createdBy?.email;
    if (userEmail) {
      await sendMail({
        to: userEmail,
        subject: `[${ticket.ticketNumber}] Estado actualizado - SIMR`,
        html: `
          <h2>Actualización de ticket de soporte</h2>
          <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Asunto:</strong> ${ticket.subject}</p>
          <p><strong>Estado anterior:</strong> ${oldStatus}</p>
          <p><strong>Estado actual:</strong> ${ticket.status}</p>
          <p>Actualizado por: ${changedBy?.fullName || changedBy?.username || "Administrador"}</p>
          <hr />
          <small>SIMR - Universidad de Antioquia</small>
        `,
      });
    }
  } catch (err) {
    console.warn("[soporte] Error al notificar cambio de estado:", err.message);
  }
}

async function notifyNewResponse(ticket, response) {
  try {
    await ticket.populate("createdBy", "email fullName username");
    const userEmail = ticket.createdBy?.email;

    if (response.isStaff && userEmail) {
      await sendMail({
        to: userEmail,
        subject: `[${ticket.ticketNumber}] Nueva respuesta - SIMR`,
        html: `
          <h2>Nueva respuesta en tu ticket de soporte</h2>
          <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Asunto:</strong> ${ticket.subject}</p>
          <p><strong>Respuesta:</strong></p>
          <p>${response.message}</p>
          <hr />
          <small>SIMR - Universidad de Antioquia</small>
        `,
      });
    }
  } catch (err) {
    console.warn("[soporte] Error al notificar nueva respuesta:", err.message);
  }
}

exports.create = async (req, res) => {
  try {
    const ticket = new SupportTicket(req.body);
    ticket.createdBy = req.user;
    ticket.ticketNumber = await SupportTicket.generateTicketNumber();
    const saved = await ticket.save();
    await saved.populate("createdBy", "firstName lastName fullName username email");
    notifyTicketCreated(saved);
    res.json(saved);
  } catch (err) {
    res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Si el usuario NO tiene permiso "any", filtra solo sus tickets
    const permissionService = require("../services/permission.service");
    const canReadAny = await permissionService.hasPermission(req.user, "soporte", "read", "any");
    if (!canReadAny) {
      filter.createdBy = req.user._id;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      filter.$or = [{ subject: re }, { description: re }, { ticketNumber: re }];
    }

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .populate("createdBy", "firstName lastName fullName username email")
      .populate("assignedTo", "firstName lastName fullName username")
      .populate("responses.user", "firstName lastName fullName username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: tickets,
      total,
      page,
      limit,
    });
  } catch (err) {
    res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.read = (req, res) => {
  res.json(req.supportTicket);
};

exports.update = async (req, res) => {
  try {
    const ticket = req.supportTicket;
    const oldStatus = ticket.status;

    if (req.body.subject !== undefined) ticket.subject = req.body.subject;
    if (req.body.description !== undefined) ticket.description = req.body.description;
    if (req.body.priority !== undefined) ticket.priority = req.body.priority;
    if (req.body.status !== undefined) {
      ticket.status = req.body.status;
      if (req.body.status === "resuelto" || req.body.status === "cerrado") {
        ticket.resolvedAt = new Date();
      } else {
        ticket.resolvedAt = null;
      }
    }
    if (req.body.assignedTo !== undefined) ticket.assignedTo = req.body.assignedTo;

    const saved = await ticket.save();
    await saved.populate([
      { path: "createdBy", select: "firstName lastName fullName username email" },
      { path: "assignedTo", select: "firstName lastName fullName username" },
      { path: "responses.user", select: "firstName lastName fullName username" },
    ]);

    if (oldStatus !== saved.status) {
      notifyStatusChange(saved, oldStatus, req.user);
    }

    res.json(saved);
  } catch (err) {
    res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.delete = async (req, res) => {
  try {
    const ticket = req.supportTicket;
    await SupportTicket.deleteOne({ _id: ticket._id });
    res.json(ticket);
  } catch (err) {
    res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.addResponse = async (req, res) => {
  try {
    const ticket = req.supportTicket;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).send({ message: "El mensaje no puede estar vacío" });
    }

    const permissionService = require("../services/permission.service");
    const isStaff = await permissionService.hasPermission(req.user, "soporte", "update", "any");

    const response = {
      message: message.trim(),
      user: req.user._id,
      isStaff,
      createdAt: new Date(),
    };

    ticket.responses.push(response);
    ticket.updatedAt = new Date();

    // Si el staff responde y el ticket está abierto, pasar a pendiente
    if (isStaff && ticket.status === "abierto") {
      ticket.status = "pendiente";
    }

    // Si el usuario responde y el ticket está pendiente, volver a abierto
    if (!isStaff && ticket.status === "pendiente") {
      ticket.status = "abierto";
    }

    const saved = await ticket.save();
    await saved.populate([
      { path: "createdBy", select: "firstName lastName fullName username email" },
      { path: "assignedTo", select: "firstName lastName fullName username" },
      { path: "responses.user", select: "firstName lastName fullName username" },
    ]);

    const lastResponse = saved.responses[saved.responses.length - 1];
    notifyNewResponse(saved, lastResponse);

    res.json(saved);
  } catch (err) {
    res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.supportTicketByID = async (req, res, next, id) => {
  try {
    const ticket = await SupportTicket.findById(id)
      .populate("createdBy", "firstName lastName fullName username email")
      .populate("assignedTo", "firstName lastName fullName username")
      .populate("responses.user", "firstName lastName fullName username");

    if (!ticket) {
      return next(new Error("Fallo al cargar el ticket " + id));
    }

    // Verificar ownership si no tiene permiso "any"
    const permissionService = require("../services/permission.service");
    const canReadAny = await permissionService.hasPermission(req.user, "soporte", "read", "any");
    const ownerId = ticket.createdBy?._id || ticket.createdBy;
    if (!canReadAny && String(ownerId) !== String(req.user._id)) {
      return res.status(403).send({ message: "No autorizado" });
    }

    req.supportTicket = ticket;
    next();
  } catch (err) {
    return next(err);
  }
};
