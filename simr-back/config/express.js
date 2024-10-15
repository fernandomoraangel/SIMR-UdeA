const config = require('./config');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const compress = require('compression');
// const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const cors = require('cors');

// const MongoStore = require('connect-mongo');

// Función para inicializar la aplicación express
module.exports = function () {
	// Instanciar la aplicación
	const app = express();
	
	// Rutas para la API
	const apiRouter = express.Router();
	
	// ================== CORS ===========================
	// Habilitar CORS - Para permitir que el frontend se comunique con el backend
	// const corsOptionsAngular = {
	// 	origin: 'http://localhost:4200', // Reemplazar 'http://localhost:4200' con la URL del frontend
	// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	// 	allowedHeaders: ['Content-Type', 'Authorization'], // Especifica los encabezados permitidos
	// 	credentials: true, // Habilitar el envío de credenciales (cookies, cabeceras de autorización, etc.)
	// };

	// const corsOptionsLocal = {
	// 	origin: 'http://localhost:3000',
	// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	// 	allowedHeaders: ['Content-Type', 'Authorization']
	// };

	// // app.use(cors(corsOptionsAngular));

	// // Middleware CORS para la API
	// apiRouter.use((req, res, next) => {
	// 	const origin = req.headers.origin;
	// 	if (origin === 'http://localhost:4200') {
	// 		cors(corsOptionsAngular)(req, res, next);
	// 	} else {
	// 		cors(corsOptionsLocal)(req, res, next);
	// 	}
	// });

	
	// // Configurando manualmente los encabezados CORS
	// app.use((req, res, next) => {
	// 	res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Reemplazar con la URL del frontend
			// res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 	res.header('Access-Control-Allow-Credentials', 'true'); // Añadir este encabezado
	// 	next();
	// });

	// Usando el middleware CORS de Express
	app.use(cors({
		origin: 'http://localhost:4200',  // Permitir solicitudes solo desde http://localhost:4200
		methods: ['GET', 'POST', 'DELETE', 'PUT'], // Permitir los métodos que necesitas
		allowedHeaders: ['Content-Type', 'Authorization'], // Especifica los encabezados permitidos
		credentials: true // Permitir envío de cookies y credenciales si es necesario
	}));



	// app.use((req, res, next) => {
	// 	res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Reemplazar 'http://localhost:4200' con la URL del frontend
	// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 	next();
	// });

	// const corsOptions = {
	// 	origin: 'http://localhost:4200', // Cambia esto al origen de tu frontend
	// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	// 	credentials: true,
	// 	optionsSuccessStatus: 204
	// };

	// app.use(cors(corsOptions));

	// ===================================================

	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		// Para subir a Heroku
		require('dotenv').config()
		const DB_URI = process.env.DB_URI
		const PORT = process.env.PORT
		app.use(compress());
	}

	// app.use(bodyParser.urlencoded({
	// 	extended: true
	// }));
	// app.use(bodyParser.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json()); // Middleware para analizar el cuerpo JSON


	app.use(methodOverride());

	// Configurar el middleware para manejo de sesiones, añade un objeto session a todos los objetos request
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret
	}));

	// app.use(session({
	// 	secret: config.sessionSecret, // Reemplaza con una clave secreta segura
	// 	resave: true,
	// 	saveUninitialized: true,
	// 	cookie: {
	// 		secure: false, // Establece true si estás utilizando HTTPS
	// 		httpOnly: true,
	// 		sameSite: 'None' // Asegura que la cookie se envíe en todos los contextos
	// 	}
	// }));

	// app.use(session({
	// 	secret: 'config.sessionSecret',
	// 	resave: false,
	// 	saveUninitialized: false,
	// 	store: MongoStore.create({
	// 		mongoUrl: 'config.db',
	// 		collectionName: 'sessions'
	// 	}),
	// 	cookie: {
	// 		maxAge: 1000 * 60 * 60 * 24 // 1 día
	// 	}
	// }));

	// Configurar el directorio views
	app.set('views', './app/views');

	// Configurar el motor de plantillas
	app.set('view engine', 'ejs');

	// Registrar flash
	app.use(flash());

	// Configurar passport
	app.use(passport.initialize());
	app.use(passport.session());

	// Requerimos su archivo de enrutamiento
	require('../app/routes/index.server.routes.js')(app);
	require('../app/routes/users.server.routes.js')(app);
	require('../app/routes/obras.server.routes.js')(app);
	require('../app/routes/actores.server.routes.js')(app);
	require('../app/routes/recursos.server.routes.js')(app);
	require('../app/routes/generos.server.routes.js')(app);
	require('../app/routes/generosnomusicales.server.routes.js')(app);
	require('../app/routes/materias.server.routes.js')(app);
	require('../app/routes/instrumentos.server.routes.js')(app);
	require('../app/routes/proyectos.server.routes.js')(app);
	require('../app/routes/medios.server.routes.js')(app);
	require('../app/routes/sistemas.server.routes.js')(app);
	require('../app/routes/fondos.server.routes.js')(app);
	require('../app/routes/colecciones.server.routes.js')(app);
	require('../app/routes/ejemplares.server.routes.js')(app);
	require('../app/routes/idiomas.server.routes.js')(app);
	require('../app/routes/diccionarios.server.routes.js')(app);
	require('../app/routes/archivos.server.routes.js')(app);

	// Midleware para servir archivos estáticos, su argumeno ubica el directorio para los archivos estáticos
	// app.use(express.static('./public'));
	app.use(express.static('../simr-front/src/app/angularjs'));

	// Devuelve la instancia de la aplicación
	return app;
};
