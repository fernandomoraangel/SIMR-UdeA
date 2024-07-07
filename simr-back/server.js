//Definir entorno de desarrollo, no de producción
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//process.env.NODE_ENV=process.env.NODE_ENV ||'production';

// const express = require('express');
// const mongoose = require('mongoose');
// const passport = require('passport');
const express = require('./config/express');
const mongoose = require('./config/mongoose');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const cors = require('cors');

//Crear instancia del objeto db
const db = mongoose();

//Crear instancia del objeto express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

//Crear instancia del objeto passport
const passportObj = passport();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});