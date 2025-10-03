// Cargar variables de entorno ANTES que nada
require("dotenv").config();

// Definir entorno de desarrollo, no de producción
// process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// process.env.NODE_ENV=process.env.NODE_ENV ||'production';

const express = require("./config/express");
const mongoose = require("./config/mongoose");
const passport = require("./config/passport");

// Crear instancia del objeto db
const db = mongoose();

// Crear instancia del objeto express
const app = express();

// Inicializar MinIO solo si está disponible
try {
  const { router: minioRouter, initializeBucket } = require("./config/minio");

  // Inicializar el bucket de MinIO
  initializeBucket()
    .then(() => {
      console.log("✅ MinIO inicializado correctamente");
      // Usar las rutas de MinIO DESPUÉS de configurar express
      app.use("/files", minioRouter);
    })
    .catch((error) => {
      console.warn("⚠️ MinIO no disponible:", error.message);
      console.log("🔄 El servidor continuará sin funcionalidad de archivos");
    });
} catch (error) {
  console.warn("⚠️ MinIO no pudo cargarse:", error.message);
  console.log("🔄 El servidor continuará sin funcionalidad de archivos");
}

// Iniciar el servidor http
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Servidor ejecutandose en el puerto ${PORT}`);
  console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});

module.exports = app;
