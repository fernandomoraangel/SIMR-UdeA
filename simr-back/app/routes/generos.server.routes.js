'use strict';

//Cargar dependencias

const passport = require('passport');
const generos = require('../../app/controllers/generos.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'generos'
	app.route('/api/generos')
	.get(generos.list)
	.post(requireAuth, authorize('genero', 'create'), generos.create);

	//Configurar las rutas a 'generos' parametrizadas
	app.route('/api/generos/:generoId')
	.get(generos.read)
	.put(
		requireAuth,
		authorize('genero', 'update', {
			checkOwnership: (req) => req.genero.creador.id === req.user.id,
		}),
		generos.update
	)
	.delete(
		requireAuth,
		authorize('genero', 'delete', {
			checkOwnership: (req) => req.genero.creador.id === req.user.id,
		}),
		generos.delete
	);

	//Configurar el parámetro middleware generoId
	app.param('generoId',generos.generoByID);
};