'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	sistemas=require('../../app/controllers/sistemas.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/sistemas')
	.get(sistemas.list)
	.post(users.requiresLogin,sistemas.create);

	//Configurar las rutas a 'sistemas' parametrizadas
	app.route('/api/sistemas/:sistemaId')
	.get(sistemas.read)
	.put(users.requiresLogin,sistemas.hasAuthorization,sistemas.update)
	.delete(users.requiresLogin,sistemas.hasAuthorization,sistemas.delete);

	//Configurar el parámetro middleware obraId
	app.param('sistemaId',sistemas.sistemaByID);
};