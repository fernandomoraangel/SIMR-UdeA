'use strict';

//Cargar dependencias

var users=require('../controllers/users.server.controller'),
	diccionarios=require('../controllers/diccionarios.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base 
	app.route('/api/diccionarios')
	.get(diccionarios.list)
	.post(users.requiresLogin,diccionarios.create);

	//Configurar las rutas a  parametrizadas
	app.route('/api/diccionarios/:diccionarioId')
	.get(diccionarios.read)
	.put(users.requiresLogin,diccionarios.hasAuthorization,diccionarios.update)
	.delete(users.requiresLogin,diccionarios.hasAuthorization,diccionarios.delete);

	//Configurar el parámetro middleware
	app.param('diccionarioId',diccionarios.diccionarioByID);
};