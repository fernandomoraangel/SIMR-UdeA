'use strict';

//Cargar dependencias

const passport = require('passport');
const actores = require('../../app/controllers/actores.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports = function (app) {
	//Configurar ruta base a 'actores'
	app.route('/api/actores')
		.get(actores.list)
		.post(requireAuth, authorize('actor', 'create'), actores.create);

	//Configurar las rutas a 'actores' parametrizadas
	app.route('/api/actores/:actorId')
		.get(actores.read)
		.put(
			requireAuth,
			authorize('actor', 'update', {
				checkOwnership: (req) => req.actor.creador.id === req.user.id,
			}),
			actores.update
		)
		.delete(
			requireAuth,
			authorize('actor', 'delete', {
				checkOwnership: (req) => req.actor.creador.id === req.user.id,
			}),
			actores.delete
		);

	//Configurar el parámetro middleware actorId
	app.param('actorId', actores.actorByID);
};