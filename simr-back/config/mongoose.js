//Invocar el modo 'strict' de javascript
"use strict";

//Cargar dependencias del módulo
var config = require("./config"),
  mongoose = require("mongoose");
mongoose.set("strictQuery", false);
//Definir el método de configuración de mongoose
module.exports = function () {
  //Usar Mongoose para conectar a MongoDB
  var db = mongoose.connect(config.db);
  //Cargar modelos
  require("../app/models/user.server.model");
  require("../app/models/actor.server.model");
  require("../app/models/obra.server.model");
  require("../app/models/recurso.server.model");
  require("../app/models/genero.server.model");
  require("../app/models/generonomusical.server.model");
  require("../app/models/materia.server.model");
  require("../app/models/instrumento.server.model");
  require("../app/models/proyecto.server.model");
  require("../app/models/medio.server.model");
  require("../app/models/sistema.server.model");
  require("../app/models/fondo.server.model");
  require("../app/models/coleccion.server.model");
  require("../app/models/ejemplar.server.model");
  require("../app/models/user.server.model");
  require("../app/models/idioma.server.model");
  require("../app/models/diccionario.server.model");
  //console.log("Carga de modelos");
  //Devolver la instancia de conexión a Mongoose
  return db;
};
