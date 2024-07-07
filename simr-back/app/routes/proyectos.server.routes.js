'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	proyectos=require('../../app/controllers/proyectos.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'proyectos'
	app.route('/api/proyectos')
	.get(proyectos.list)
	.post(users.requiresLogin,proyectos.create);

	//Configurar las rutas a 'proyectos' parametrizadas
	app.route('/api/proyectos/:proyectoId')
	.get(proyectos.read)
	.put(users.requiresLogin,proyectos.hasAuthorization,proyectos.update)
	.delete(users.requiresLogin,proyectos.hasAuthorization,proyectos.delete);

	//Configurar el parámetro middleware proyectoId
	app.param('proyectoId',proyectos.proyectoByID);
};