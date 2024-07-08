//Definir entorno de desarrollo, no de producción
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//process.env.NODE_ENV=process.env.NODE_ENV ||'production';

// const express = require('express');
// const mongoose = require('mongoose');
// const passport = require('passport');
const express = require('./config/express');
const mongoose = require('./config/mongoose');
const passport = require('./config/passport');
// const bodyParser = require('body-parser');
// const cors = require('cors');

//Crear instancia del objeto db
const db = mongoose();

// Crear instancia del objeto express
const app = express();

// // Enable CORS
// app.use(cors());

// var corsOptions = {
//   origin: 'http://localhost:4200',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

// Set CORS headers
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Replace 'http://localhost:4200' with the URL of your frontend
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// Middleware
// app.use(bodyParser.json());

// app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:4200' // Cambia esto a la URL de tu frontend
// }));
// app.use(express.json());

// Definir tus rutas
// app.use('/api/actores', actorRoutes);

//Crear instancia del objeto passport
// const passportObj = passport();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});