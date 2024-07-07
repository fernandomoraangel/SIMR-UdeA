'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	actores=require('../../app/controllers/actores.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'actores'
	app.route('/api/actores')
	.get(actores.list)
	.post(users.requiresLogin,actores.create);

	//Configurar las rutas a 'actores' parametrizadas
	app.route('/api/actores/:actorId')
	.get(actores.read)
	.put(users.requiresLogin,actores.hasAuthorization,actores.update)
	.delete(users.requiresLogin,actores.hasAuthorization,actores.delete);

	//Configurar el parámetro middleware obraId
	app.param('actorId',actores.actorByID);
};