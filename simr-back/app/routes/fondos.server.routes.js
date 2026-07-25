'use strict';

//Cargar dependencias

const passport = require('passport');
const fondos = require('../../app/controllers/fondos.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'fondos'
	app.route('/api/fondos')
	.get(fondos.list)
	.post(requireAuth, authorize('fondo', 'create'), fondos.create);

	//Configurar las rutas a 'fondos' parametrizadas
	app.route('/api/fondos/:fondoId')
	.get(fondos.read)
	.put(
		requireAuth,
		authorize('fondo', 'update', {
			checkOwnership: (req) => req.fondo.creador.id === req.user.id,
		}),
		fondos.update
	)
	.delete(
		requireAuth,
		authorize('fondo', 'delete', {
			checkOwnership: (req) => req.fondo.creador.id === req.user.id,
		}),
		fondos.delete
	);

	//Configurar el parámetro middleware fondoId
	app.param('fondoId',fondos.fondoByID);
};