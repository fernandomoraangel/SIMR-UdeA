'use strict';

//Cargar dependencias

const passport = require('passport');
const diccionarios = require('../controllers/diccionarios.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base
	app.route('/api/diccionarios')
	.get(requireAuth, authorize('diccionario', 'read'), diccionarios.list)
	.post(requireAuth, authorize('diccionario', 'create'), diccionarios.create);

	//Configurar las rutas a  parametrizadas
	app.route('/api/diccionarios/:diccionarioId')
	.get(requireAuth, authorize('diccionario', 'read'), diccionarios.read)
	.put(
		requireAuth,
		authorize('diccionario', 'update', {
			checkOwnership: (req) => req.diccionario.creador.id === req.user.id,
		}),
		diccionarios.update
	)
	.delete(
		requireAuth,
		authorize('diccionario', 'delete', {
			checkOwnership: (req) => req.diccionario.creador.id === req.user.id,
		}),
		diccionarios.delete
	);

	//Configurar el parámetro middleware
	app.param('diccionarioId',diccionarios.diccionarioByID);
};