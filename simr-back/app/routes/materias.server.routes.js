'use strict';

//Cargar dependencias

var users=require('../../app/controllers/users.server.controller'),
	materias=require('../../app/controllers/materias.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'materias'
	app.route('/api/materias')
	.get(materias.list)
	.post(users.requiresLogin,materias.create);

	//Configurar las rutas a 'materias' parametrizadas
	app.route('/api/materias/:materiaId')
	.get(materias.read)
	.put(users.requiresLogin,materias.hasAuthorization,materias.update)
	.delete(users.requiresLogin,materias.hasAuthorization,materias.delete);

	//Configurar el parámetro middleware materiaId
	app.param('materiaId',materias.materiaByID);
};