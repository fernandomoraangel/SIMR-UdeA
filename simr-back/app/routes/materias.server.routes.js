'use strict';

//Cargar dependencias

const passport = require('passport');
const materias = require('../../app/controllers/materias.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'materias'
	app.route('/api/materias')
	.get(materias.list)
	.post(requireAuth, authorize('materia', 'create'), materias.create);

	//Configurar las rutas a 'materias' parametrizadas
	app.route('/api/materias/:materiaId')
	.get(materias.read)
	.put(
		requireAuth,
		authorize('materia', 'update', {
			checkOwnership: (req) => req.materia.creador.id === req.user.id,
		}),
		materias.update
	)
	.delete(
		requireAuth,
		authorize('materia', 'delete', {
			checkOwnership: (req) => req.materia.creador.id === req.user.id,
		}),
		materias.delete
	);

	//Configurar el parámetro middleware materiaId
	app.param('materiaId',materias.materiaByID);
};