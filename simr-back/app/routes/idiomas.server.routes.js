'use strict';

//Cargar dependencias

var users=require('../controllers/users.server.controller'),
	idiomas=require('../controllers/idiomas.server.controller');

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base 
	app.route('/api/idiomas')
	.get(idiomas.list)
	.post(users.requiresLogin,idiomas.create);

	//Configurar las rutas a  parametrizadas
	app.route('/api/idiomas/:idiomaId')
	.get(idiomas.read)
	.put(users.requiresLogin,idiomas.hasAuthorization,idiomas.update)
	.delete(users.requiresLogin,idiomas.hasAuthorization,idiomas.delete);

	//Configurar el parámetro middleware
	app.param('idiomaId',idiomas.idiomaByID);
};