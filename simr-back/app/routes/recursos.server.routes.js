'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	recursos=require('../../app/controllers/recursos.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/recursos')
	.get(recursos.list)
	.post(users.requiresLogin,recursos.create);

	//Configurar las rutas a 'recursos' parametrizadas
	app.route('/api/recursos/:recursoId')
	.get(recursos.read)
	.put(users.requiresLogin,recursos.hasAuthorization,recursos.update)
	.delete(users.requiresLogin,recursos.hasAuthorization,recursos.delete);

	//Configurar el parámetro middleware obraId
	app.param('recursoId',recursos.recursoByID);
};