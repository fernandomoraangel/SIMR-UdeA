// Cargar variables de entorno ANTES que nada
require("dotenv").config();

// Definir entorno de desarrollo, no de producción
// process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// process.env.NODE_ENV=process.env.NODE_ENV ||'production';

const express = require('./config/express');
const mongoose = require('./config/mongoose');
const passport = require('./config/passport');
const { router: minioRouter, initializeBucket } = require('./config/minio');

// Crear instancia del objeto db
const db = mongoose();

// Crear instancia del objeto express
const app = express();

// Inicializar el bucket de MinIO
initializeBucket().catch(console.error);

// Usar las rutas de MinIO
app.use('/files', minioRouter);
// app.use('/minio', minioRouter);

// Crear instancia del objeto passport
var passportObj = passport();

// Iniciar el servidor http
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	// console.log(`Servidor ejecutandose en el puerto ${PORT}`);
	console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});

module.exports = app;