'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	ejemplares=require('../../app/controllers/ejemplares.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/ejemplares')
	.get(ejemplares.list)
	.post(users.requiresLogin,ejemplares.create);

	//Configurar las rutas a 'obras' parametrizadas
	app.route('/api/ejemplares/:ejemplarId')
	.get(ejemplares.read)
	.put(users.requiresLogin,ejemplares.hasAuthorization,ejemplares.update)
	.delete(users.requiresLogin,ejemplares.hasAuthorization,ejemplares.delete);

	//Configurar el parámetro middleware obraId
	app.param('ejemplarId',ejemplares.ejemplarByID);
};