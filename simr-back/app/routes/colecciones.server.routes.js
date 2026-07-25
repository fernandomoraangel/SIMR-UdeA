'use strict';

//Cargar dependencias

const passport = require('passport');
const colecciones = require('../../app/controllers/colecciones.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'colecciones'
	app.route('/api/colecciones')
	.get(colecciones.list)
	.post(requireAuth, authorize('coleccion', 'create'), colecciones.create);

	//Configurar las rutas a 'colecciones' parametrizadas
	app.route('/api/colecciones/:coleccionId')
	.get(colecciones.read)
	.put(
		requireAuth,
		authorize('coleccion', 'update', {
			checkOwnership: (req) => req.coleccion.creador.id === req.user.id,
		}),
		colecciones.update
	)
	.delete(
		requireAuth,
		authorize('coleccion', 'delete', {
			checkOwnership: (req) => req.coleccion.creador.id === req.user.id,
		}),
		colecciones.delete
	);

	//Configurar el parámetro middleware coleccionId
	app.param('coleccionId',colecciones.coleccionByID);
};