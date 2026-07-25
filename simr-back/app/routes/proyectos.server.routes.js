'use strict';

//Cargar dependencias

const passport = require('passport');
const proyectos = require('../../app/controllers/proyectos.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'proyectos'
	app.route('/api/proyectos')
	.get(proyectos.list)
	.post(requireAuth, authorize('proyecto', 'create'), proyectos.create);

	//Configurar las rutas a 'proyectos' parametrizadas
	app.route('/api/proyectos/:proyectoId')
	.get(proyectos.read)
	.put(
		requireAuth,
		authorize('proyecto', 'update', {
			checkOwnership: (req) => req.proyecto.creador.id === req.user.id,
		}),
		proyectos.update
	)
	.delete(
		requireAuth,
		authorize('proyecto', 'delete', {
			checkOwnership: (req) => req.proyecto.creador.id === req.user.id,
		}),
		proyectos.delete
	);

	//Configurar el parámetro middleware proyectoId
	app.param('proyectoId',proyectos.proyectoByID);
};