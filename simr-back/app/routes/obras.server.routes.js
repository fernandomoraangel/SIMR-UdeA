"use strict";

//Cargar dependencias
const passport = require("passport");
const obras = require("../../app/controllers/obras.server.controller");
const { authorize } = require("../middleware/authorize.middleware");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base a 'obras'
  app
    .route("/api/obras")
    .get(obras.list)
    .post(requireAuth, authorize("obra", "create"), obras.create);

  //Configurar las rutas a 'obras' parametrizadas
  app
    .route("/api/obras/:obraId")
    .get(obras.read)
    .put(
      requireAuth,
      authorize("obra", "update", {
        checkOwnership: (req) => req.obra.creador.id === req.user.id,
      }),
      obras.update
    )
    .delete(
      requireAuth,
      authorize("obra", "delete", {
        checkOwnership: (req) => req.obra.creador.id === req.user.id,
      }),
      obras.delete
    );

  //Configurar el parámetro middleware obraId
  app.param("obraId", obras.obraByID);
};
