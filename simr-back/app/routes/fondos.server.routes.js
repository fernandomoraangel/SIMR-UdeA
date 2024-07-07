'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	fondos=require('../../app/controllers/fondos.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/fondos')
	.get(fondos.list)
	.post(users.requiresLogin,fondos.create);

	//Configurar las rutas a 'fondos' parametrizadas
	app.route('/api/fondos/:fondoId')
	.get(fondos.read)
	.put(users.requiresLogin,fondos.hasAuthorization,fondos.update)
	.delete(users.requiresLogin,fondos.hasAuthorization,fondos.delete);

	//Configurar el parámetro middleware obraId
	app.param('fondoId',fondos.fondoByID);
};