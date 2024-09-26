require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const minio = require('minio');
const path = require('path');
// const fs = require('fs');

// Previsualization
const mime = require('mime-types');
const rangeParser = require('range-parser'); // Para streaming de video y audio 
// (fin previsualization)

// Configurar cliente MinIO
const minioClient = new minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const myBucketName = process.env.MINIO_BUCKET_NAME;

// Configurar multer para manejar la carga de archivos
const upload = multer({ storage: multer.memoryStorage() });

// // Configurar multer para establecer límite de tamaño de archivos que se suben al sistema de archivos
// const upload = multer({
//   dest: 'uploads/',
//   limits: {
//     fileSize: 1024 * 1024 * 100 // 100 MB limit
//   }
// });

// Función para inicializar el bucket
const initializeBucket = async () => {
  const exists = await minioClient.bucketExists(myBucketName);
  if (!exists) {
    await minioClient.makeBucket(myBucketName, 'us-east-1');
    console.log('Bucket ' + myBucketName + ' created in "us-east-1"');
  } else {
    console.log('Bucket ' + myBucketName + ' already exists');
  }
};

// ### RUTAS ###

// *** SUBIR ARCHIVOS ***
// Ruta para subir archivos
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido algún archivo');
  }

  // Obtener la extensión del archivo
  const extension = path.extname(req.file.originalname);

  // Obtener el nombre del archivo sin la extensión
  const fileName = path.basename(req.file.originalname, extension);

  const objectName = `${fileName}-${Date.now()}${extension}`;
  const fileBuffer = req.file.buffer;

  console.log('fileBuffer:', fileBuffer);

  try {
    await minioClient.putObject(myBucketName, objectName, fileBuffer);
    res.status(200).json({ message: 'Archivo subido con éxito' }); // Respuesta de formato JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al subir el archivo' }); // Respuesta de formato JSON
  }
});

// *** LISTAR ARCHIVOS ***
// Ruta para listar archivos
router.get('/files', async (req, res) => {
  const stream = minioClient.listObjects(myBucketName, '', true);
  const files = [];

  stream.on('data', (obj) => {
    files.push({
      name: obj.name,
      size: obj.size,
      lastModified: obj.lastModified
    });
  });

  stream.on('error', (err) => {
    console.error(err);
    res.status(500).json({ message: 'Error al listar los archivos' });
  });

  stream.on('end', () => {
    res.json(files);
  });
});

// *** DESCARGAR ARCHIVOS ***
// Ruta para descargar archivos
router.get('/download/:filename', async (req, res) => {
  const objectName = req.params.filename;

  try {
    const fileStream = await minioClient.getObject(myBucketName, objectName);
    res.setHeader('Content-Disposition', `attachment; filename="${objectName}"`);
    fileStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al descargar el archivo' });
  }
});

// *** ELIMINAR ARCHIVO ***
// Ruta para eliminar un archivo
router.delete('/delete/:filename', async (req, res) => {
  const objectName = req.params.filename;

  try {
    await minioClient.removeObject(myBucketName, objectName);
    res.status(200).json({ message: 'Archivo eliminado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el archivo' });
  }

  // ==============================
  // const maxRetries = 3;
  // let attempt = 0;

  // async function deleteObject() {
  //   attempt++;
  //   try {
  //     await minioClient.removeObject(bucketName, objectName);
  //     return res.status(200).json({ message: 'Archivo eliminado con éxito' });
  //   } catch (err) {
  //     if (attempt < maxRetries) {
  //       console.error(`Attempt ${attempt} failed: ${err.message}. Retrying...`);
  //       setTimeout(deleteObject, Math.pow(2, attempt) * 1000); // Backoff exponencial
  //     } else {
  //       console.error('Max retries reached:', err);
  //       return res.status(500).json({ message: 'Error al eliminar el archivo' });
  //     }
  //   }
  // }

  // deleteObject();
  // ==============================

});

// *** ELIMINAR MULTIPLES ARCHIVOS ***
// Ruta para eliminar multiples archivos
router.post('/delete-multiple', async (req, res) => {
  const filenames = req.body.filenames;

  if (!Array.isArray(filenames) || filenames.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de nombres de archivo' });
  }

  try {
    await Promise.all(filenames.map(filename => minioClient.removeObject(myBucketName, filename)));
    res.status(200).json({ message: 'Archivos eliminados con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar los archivos' });
  }
});

// *** PREVISUALIZACION ***
// Ruta para previsualizar archivos
router.get('/view/:filename', async (req, res) => {
  const objectName = req.params.filename;

  try {
    const stat = await minioClient.statObject(myBucketName, objectName);
    const contentType = mime.lookup(objectName) || 'application/octet-stream';
    const fileSize = stat.size;

    // Configurar headers para streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');

    // Manejar solicitudes de rango
    const range = req.headers.range;
    if (range) {
      const parts = rangeParser(fileSize, range);

      if (parts && parts.type === 'bytes' && parts.length === 1) {
        const [{ start, end }] = parts;
        const chunksize = (end - start) + 1;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunksize);
        res.status(206); // Partial Content

        const stream = await minioClient.getPartialObject(myBucketName, objectName, start, end - start + 1);
        stream.pipe(res);
      } else {
        res.status(416).send('Range Not Satisfiable');
      }
    } else {
      res.setHeader('Content-Length', fileSize);
      const stream = await minioClient.getObject(myBucketName, objectName);
      stream.pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el archivo' });
  }
});

// ###(Fin de RUTAS)###


module.exports = {
  router,
  initializeBucket
};