'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	colecciones=require('../../app/controllers/colecciones.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/colecciones')
	.get(colecciones.list)
	.post(users.requiresLogin,colecciones.create);

	//Configurar las rutas a 'colecciones' parametrizadas
	app.route('/api/colecciones/:coleccionId')
	.get(colecciones.read)
	.put(users.requiresLogin,colecciones.hasAuthorization,colecciones.update)
	.delete(users.requiresLogin,colecciones.hasAuthorization,colecciones.delete);

	//Configurar el parámetro middleware obraId
	app.param('coleccionId',colecciones.coleccionByID);
};