"use strict";

// Registrar modelo ANTES que el controlador
require("../../app/models/support-ticket.server.model");

const passport = require("passport");
const tickets = require("../controllers/support-ticket.server.controller");
const { authorize } = require("../middleware/authorize.middleware");

const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  app
    .route("/api/soporte")
    .get(requireAuth, authorize("soporte", "read"), tickets.list)
    .post(requireAuth, authorize("soporte", "create"), tickets.create);

  app
    .route("/api/soporte/:ticketId")
    .get(requireAuth, authorize("soporte", "read"), tickets.read)
    .put(
      requireAuth,
      authorize("soporte", "update", {
        checkOwnership: (req) => String(req.supportTicket.createdBy?._id || req.supportTicket.createdBy) === String(req.user._id),
      }),
      tickets.update
    )
    .delete(
      requireAuth,
      authorize("soporte", "delete"),
      tickets.delete
    );

  app
    .route("/api/soporte/:ticketId/respuestas")
    .post(requireAuth, authorize("soporte", "update"), tickets.addResponse);

  app.param("ticketId", tickets.supportTicketByID);
};
