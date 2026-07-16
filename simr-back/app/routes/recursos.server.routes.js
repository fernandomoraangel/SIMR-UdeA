'use strict';

//Cargar dependencias

const passport = require('passport');
const recursos = require('../../app/controllers/recursos.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'recursos'
	app.route('/api/recursos')
	.get(requireAuth, authorize('recurso', 'read'), recursos.list)
	.post(requireAuth, authorize('recurso', 'create'), recursos.create);

	//Configurar las rutas a 'recursos' parametrizadas
	app.route('/api/recursos/:recursoId')
	.get(requireAuth, authorize('recurso', 'read'), recursos.read)
	.put(
		requireAuth,
		authorize('recurso', 'update', {
			checkOwnership: (req) => req.recurso.creador.id === req.user.id,
		}),
		recursos.update
	)
	.delete(
		requireAuth,
		authorize('recurso', 'delete', {
			checkOwnership: (req) => req.recurso.creador.id === req.user.id,
		}),
		recursos.delete
	);

	//Configurar el parámetro middleware recursoId
	app.param('recursoId',recursos.recursoByID);
};