'use strict';

//Cargar dependencias

const passport = require('passport');
const sistemas = require('../../app/controllers/sistemas.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'sistemas'
	app.route('/api/sistemas')
	.get(sistemas.list)
	.post(requireAuth, authorize('sistema', 'create'), sistemas.create);

	//Configurar las rutas a 'sistemas' parametrizadas
	app.route('/api/sistemas/:sistemaId')
	.get(sistemas.read)
	.put(
		requireAuth,
		authorize('sistema', 'update', {
			checkOwnership: (req) => req.sistema.creador.id === req.user.id,
		}),
		sistemas.update
	)
	.delete(
		requireAuth,
		authorize('sistema', 'delete', {
			checkOwnership: (req) => req.sistema.creador.id === req.user.id,
		}),
		sistemas.delete
	);

	//Configurar el parámetro middleware sistemaId
	app.param('sistemaId',sistemas.sistemaByID);
};