//Llamada a los módulos express que se utilizarán
var config=require('./config'),
	express=require('express'),
	morgan=require('morgan'),
	compress=require('compression'),
	bodyParser=require('body-parser'),
	methodOverride=require('method-override'),
	session=require('express-session'),
	flash=require('connect-flash'),
	passport=require('passport');
//Función para inicializar la aplicación express
module.exports=function() {
	//Instanciar la aplicación
	var app=express();
	if (process.env.NODE_ENV==='development'){
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV==='production'){
		//Para subir a Heroku
		require('dotenv').config()
		const DB_URI = process.env.DB_URI
		const PORT = process.env.PORT
		app.use(compress());
	}
	app.use(bodyParser.urlencoded({
		extended:true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	//Configurar el middleware para manejo de sesiones, añade un objeto session a todos los objetos request
	app.use(session({
		saveUninitialized:true,
		resave:true,
		secret:config.sessionSecret
	}));
	//Configurar el directorio views
	app.set('views','./app/views');
	// Configurar el motor de plantillas
	app.set('view engine','ejs');
	//Registrar flash
	app.use(flash());
	//Configurar passport
	app.use(passport.initialize());
	app.use(passport.session());
	//Requerimos su archivo de enrutamiento
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
	
	//Midleware para servir archivos estáticos, su argumeno ubica el directorio para los archivos estáticos
	app.use(express.static('./public'));
	//Devuelve la instancia de la aplicación
	return app;
};
