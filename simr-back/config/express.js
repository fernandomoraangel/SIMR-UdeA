const config = require("./config");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const compress = require("compression");
const methodOverride = require("method-override");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const crypto = require("crypto");

// Función para inicializar la aplicación express
module.exports = function () {
  //* Instanciar la aplicación
  const app = express();

  //* Confiar en el proxy inverso (Nginx) para X-Forwarded-Proto/-For,
  //* necesario para que legacyShellGuard construya URLs absolutas
  //* correctas (https) y para que las cookies "secure" funcionen bien
  //* detrás de TLS terminado en Nginx.
  app.set("trust proxy", 1);

  //* Rutas para la API
  const apiRouter = express.Router();

  //* Middlewares de seguridad
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64");
    next();
  });

  // Deshabilitando CSP para desarrollo
  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP deshabilitado para desarrollo
    })
  );

  //* Parsers
  app.use(express.json({ limit: "10mb" })); // Middleware para analizar el cuerpo JSON
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // app.use(bodyParser.urlencoded({
  // 	extended: true
  // }));
  // app.use(bodyParser.json());

  // Configuración de cookies seguras
  // const cookieOptions = {
  // 	httpOnly: true,
  // 	secure: process.env.NODE_ENV === 'production', // HTTPS en producción
  // 	sameSite: 'strict',
  // 	maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  // };

  // ================== CORS ===========================

  // // Configurando manualmente los encabezados CORS
  // app.use((req, res, next) => {
  // 	res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Reemplazar con la URL del frontend
  // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  // 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // 	res.header('Access-Control-Allow-Credentials', 'true'); // Añadir este encabezado
  // 	next();
  // });

  //* CORS con soporte para cookies
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL
          : "http://localhost:4200",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Cookie",
      ],
      exposedHeaders: ["Set-Cookie"],
    })
  );

  // Usando el middleware CORS de Express (funcionando)
  // app.use(cors({
  // 	origin: ['http://localhost:4200', 'http://localhost:3000'],  // Permitir solicitudes solo desde http://localhost:4200
  // 	methods: ['GET', 'POST', 'DELETE', 'PUT'], // Permitir los métodos que necesitas
  // 	allowedHeaders: ['Content-Type', 'Authorization'], // Especifica los encabezados permitidos
  // 	credentials: true // Permitir envío de cookies y credenciales si es necesario
  // }));

  // app.use(cors({
  // 	origin: 'http://localhost:4200',  // Permitir solicitudes solo desde http://localhost:4200
  // 	methods: ['GET', 'POST', 'DELETE', 'PUT'], // Permitir los métodos que necesitas
  // 	allowedHeaders: ['Content-Type', 'Authorization'], // Especifica los encabezados permitidos
  // 	credentials: true // Permitir envío de cookies y credenciales si es necesario
  // }));

  // ===================================================

  //! Revisar si es necesario este código
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else if (process.env.NODE_ENV === "production") {
    // Para subir a Heroku
    require("dotenv").config();
    const DB_URI = process.env.DB_URI;
    const PORT = process.env.PORT;
    app.use(compress());
  }

  app.use(methodOverride());

  // Configurar el middleware para manejo de sesiones, añade un objeto session a todos los objetos request

  // Almacenar la sesión en MongoDB
  // const MongoStore = require('connect-mongo');
  // app.use(session({
  // 	secret: 'mi_clave_secreta',
  // 	store: MongoStore.create({ mongoUrl: 'mongodb://localhost/miapp' }),
  // 	resave: false,
  // 	saveUninitialized: false
  // }));

  //* Configuración de la sesión, usando MongoStore para persistencia (working 2025-06-23)
  // app.use(session({
  //   secret: process.env.SESSION_SECRET,
  //   resave: false,
  //   saveUninitialized: false,
  //   store: MongoStore.create({
  //     mongoUrl: process.env.MONGO_URI,
  //     touchAfter: 24 * 3600, // 24 hours - lazy session update - Actualiza sesión solo si han pasado 24h
  //     ttl: 24 * 60 * 60 // Time to live (24 hours) - Sesiones expiradas se eliminan automáticamente
  //   }),
  //   cookie: {
  //     secure: process.env.NODE_ENV === 'production',
  //     httpOnly: true,
  //     maxAge: 24 * 60 * 60 * 1000, // 24 hours
  //     sameSite: 'strict'
  //   }
  // }));
  //* end of (working 2025-06-23)

  //* working 2025-06-08
  // app.use(session({
  // 	saveUninitialized: true,
  // 	resave: true,
  // 	secret: config.sessionSecret
  // }));

  //* end of (working 2025-06-08)

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

  //* Middleware para debug de autenticación
  // app.use((req, res, next) => {
  //   console.log('Auth Debug:', {
  //     isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
  //     user: req.user ? req.user.email : 'No user',
  //     sessionID: req.sessionID,
  //     hasJWT: !!req.headers.authorization
  //   });
  //   next();
  // });

  //* Rutas de autenticación
  // app.use('/api/auth', require('./routes/auth'));

  //* Rutas protegidas de ejemplo
  // app.use('/api/users', require('./middleware/auth').authenticate, require('./routes/users'));
  // app.use('/api/admin', [
  //   require('./middleware/auth').authenticate,
  //   require('./middleware/auth').requireRole(['admin'])
  // ], require('./routes/admin'));

  //* Configurar el directorio views
  app.set("views", "./app/views");

  //* Configurar el motor de plantillas
  app.set("view engine", "ejs");

  // // Registrar flash
  // app.use(flash());

  // Configurar passport
  app.use(passport.initialize());
  // app.use(passport.session());

  // Middleware de manejo de errores global
  app.use((err, req, res, next) => {
    console.error("Error capturado por middleware global:", err);

    // Si es un error de JWT o autenticación
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    // Si es un error de validación
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: err.errors,
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  });

  // Servir archivos estáticos
  // AngularJS
  // app.use('/angularjs', express.static('public/angularjs'));
  // Angular (dist)
  // app.use('/angular', express.static('public/angular'));

  // Rutas de fallback para SPAs
  // app.get('/angularjs/*', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'public/angularjs/index.html'));
  // });

  // app.get('/angular/*', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'public/angular/index.html'));
  // });
  // end of (Servir archivos estáticos)

  // Ruta por defecto
  // app.get('/', (req, res) => {
  //   res.json({
  //     message: 'API MEAN Stack con autenticación híbrida',
  //     endpoints: {
  //       angularjs: '/angularjs',
  //       angular: '/angular',
  //       api: '/api'
  //     }
  //   });
  // });

  // * Archivos de enrutamiento
  require("../app/routes/index.server.routes.js")(app);
  require("../app/routes/users.server.routes.js")(app);
  require("../app/routes/obras.server.routes.js")(app);
  require("../app/routes/actores.server.routes.js")(app);
  require("../app/routes/recursos.server.routes.js")(app);
  require("../app/routes/generos.server.routes.js")(app);
  require("../app/routes/generosnomusicales.server.routes.js")(app);
  require("../app/routes/materias.server.routes.js")(app);
  require("../app/routes/instrumentos.server.routes.js")(app);
  require("../app/routes/proyectos.server.routes.js")(app);
  require("../app/routes/medios.server.routes.js")(app);
  require("../app/routes/sistemas.server.routes.js")(app);
  require("../app/routes/fondos.server.routes.js")(app);
  require("../app/routes/colecciones.server.routes.js")(app);
  require("../app/routes/ejemplares.server.routes.js")(app);
  require("../app/routes/idiomas.server.routes.js")(app);
  require("../app/routes/diccionarios.server.routes.js")(app);
  require("../app/routes/archivos.server.routes.js")(app);
  // Sistema de roles y permisos
  require("../app/routes/roles.server.routes.js")(app);
  require("../app/routes/permissions.server.routes.js")(app);
  require("../app/routes/auditlog.server.routes.js")(app);
  // Rutas para gestión de listas
  require("../app/routes/listas.server.routes.js")(app);
  // Sistema de búsqueda general
  require("../app/routes/search.server.routes.js")(app);
  // Sistema de grafo de base de datos
  require("../app/routes/graph.server.routes.js")(app);
  // Estadísticas del sistema
  require("../app/routes/stats.server.routes.js")(app);
  // Estadísticas de uso de la aplicación
  require("../app/routes/usos.server.routes.js")(app);

  // Middleware para manejo específico de errores de autenticación
  const { handleAuthError } = require("../app/middleware/authErrorHandler");
  app.use(handleAuthError);

  // Servir archivos estáticos de la build de Angular (simr-front/dist)
  // const angularDistPath = path.join(__dirname, "../../simr-front/dist/simr-front");
  // app.use(express.static(angularDistPath));

  // Fallback para SPA: servir index.html para rutas no API
  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(angularDistPath, "index.html"));
  // });

  // Devuelve la instancia de la aplicación
  return app;
};
