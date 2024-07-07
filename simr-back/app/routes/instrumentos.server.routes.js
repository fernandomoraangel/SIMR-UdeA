'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	instrumentos=require('../../app/controllers/instrumentos.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/instrumentos')
	.get(instrumentos.list)
	.post(users.requiresLogin,instrumentos.create);

	//Configurar las rutas a 'instrumentos' parametrizadas
	app.route('/api/instrumentos/:instrumentoId')
	.get(instrumentos.read)
	.put(users.requiresLogin,instrumentos.hasAuthorization,instrumentos.update)
	.delete(users.requiresLogin,instrumentos.hasAuthorization,instrumentos.delete);

	//Configurar el parámetro middleware obraId
	app.param('instrumentoId',instrumentos.instrumentoByID);
};