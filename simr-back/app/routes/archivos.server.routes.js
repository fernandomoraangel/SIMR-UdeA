'use strict';

//Cargar dependencias

var users = require('../../app/controllers/users.server.controller'),
  archivos = require('../../app/controllers/archivos.server.controller');

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base a 'archivos'
  app
    .route('/api/archivos')
    // .get(users.requiresLogin, archivos.list)
    .get(archivos.list)
    .post(users.requiresLogin, archivos.create);

  //Configurar las rutas a 'archivos' parametrizadas
  app
    .route('/api/archivos/:archivoId')
    .get(archivos.read)
    .put(users.requiresLogin, archivos.hasAuthorization, archivos.update)
    .delete(users.requiresLogin, archivos.hasAuthorization, archivos.delete);

  //Configurar el parámetro middleware obraId
  app.param('archivoId', archivos.archivoByID);
};

// .get((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// 	archivos.list(req, res, next);
// })
