'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	generos=require('../../app/controllers/generos.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'obras'
	app.route('/api/generos')
	.get(generos.list)
	.post(users.requiresLogin,generos.create);

	//Configurar las rutas a 'generos' parametrizadas
	app.route('/api/generos/:generoId')
	.get(generos.read)
	.put(users.requiresLogin,generos.hasAuthorization,generos.update)
	.delete(users.requiresLogin,generos.hasAuthorization,generos.delete);

	//Configurar el parámetro middleware obraId
	app.param('generoId',generos.generoByID);
};