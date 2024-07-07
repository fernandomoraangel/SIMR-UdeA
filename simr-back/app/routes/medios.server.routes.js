'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	medios=require('../../app/controllers/medios.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/medios')
	.get(medios.list)
	.post(users.requiresLogin,medios.create);

	//Configurar las rutas a 'medios' parametrizadas
	app.route('/api/medios/:medioId')
	.get(medios.read)
	.put(users.requiresLogin,medios.hasAuthorization,medios.update)
	.delete(users.requiresLogin,medios.hasAuthorization,medios.delete);

	//Configurar el parámetro middleware obraId
	app.param('medioId',medios.medioByID);
};