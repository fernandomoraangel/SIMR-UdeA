'use strict';

//Cargar dependencias

const passport = require('passport');
const instrumentos = require('../../app/controllers/instrumentos.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'instrumentos'
	app.route('/api/instrumentos')
	.get(requireAuth, authorize('instrumento', 'read'), instrumentos.list)
	.post(requireAuth, authorize('instrumento', 'create'), instrumentos.create);

	//Configurar las rutas a 'instrumentos' parametrizadas
	app.route('/api/instrumentos/:instrumentoId')
	.get(requireAuth, authorize('instrumento', 'read'), instrumentos.read)
	.put(
		requireAuth,
		authorize('instrumento', 'update', {
			checkOwnership: (req) => req.instrumento.creador.id === req.user.id,
		}),
		instrumentos.update
	)
	.delete(
		requireAuth,
		authorize('instrumento', 'delete', {
			checkOwnership: (req) => req.instrumento.creador.id === req.user.id,
		}),
		instrumentos.delete
	);

	//Configurar el parámetro middleware instrumentoId
	app.param('instrumentoId',instrumentos.instrumentoByID);
};