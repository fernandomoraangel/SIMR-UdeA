// Definir entorno de desarrollo, no de producción
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// process.env.NODE_ENV=process.env.NODE_ENV ||'production';

const express = require('./config/express');
const mongoose = require('./config/mongoose');
const passport = require('./config/passport');

// Crear instancia del objeto db
const db = mongoose();

// Crear instancia del objeto express
const app = express();

// Crear instancia del objeto passport
var passportObj = passport();


// Iniciar el servidor http
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	// console.log(`Servidor ejecutandose en el puerto ${PORT}`);
	console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});

module.exports = app;

