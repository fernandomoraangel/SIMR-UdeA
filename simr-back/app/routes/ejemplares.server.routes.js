'use strict';

//Cargar dependencias

const passport = require('passport');
const ejemplares = require('../../app/controllers/ejemplares.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports=function(app){
	//Configurar ruta base a 'ejemplares'
	app.route('/api/ejemplares')
	.get(ejemplares.list)
	.post(requireAuth, authorize('ejemplar', 'create'), ejemplares.create);

	//Configurar las rutas a 'ejemplares' parametrizadas
	app.route('/api/ejemplares/:ejemplarId')
	.get(ejemplares.read)
	.put(
		requireAuth,
		authorize('ejemplar', 'update', {
			checkOwnership: (req) => req.ejemplar.creador.id === req.user.id,
		}),
		ejemplares.update
	)
	.delete(
		requireAuth,
		authorize('ejemplar', 'delete', {
			checkOwnership: (req) => req.ejemplar.creador.id === req.user.id,
		}),
		ejemplares.delete
	);

	//Configurar el parámetro middleware ejemplarId
	app.param('ejemplarId',ejemplares.ejemplarByID);
};