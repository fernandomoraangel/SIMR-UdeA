require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const minio = require('minio');
const path = require('path');
// const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
let clientConnection;

// Entidades que usan archivos
const Archivo = require('../app/models/archivo.server.model');
const Actor = require('../app/models/actor.server.model');
const Obra = require('../app/models/obra.server.model');
const Proyecto = require('../app/models/proyecto.server.model');
const Recurso = require('../app/models/recurso.server.model');
const Instrumento = require('../app/models/instrumento.server.model');
const Medio = require('../app/models/medio.server.model');
const Sistema = require('../app/models/sistema.server.model');
const Materia = require('../app/models/materia.server.model');
const Genero = require('../app/models/genero.server.model');
const GeneroNoMusical = require('../app/models/generonomusical.server.model');

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

// Configuración de conexión a MongoDB
const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
// const client = new MongoClient(mongoUrl);
const client = new MongoClient(mongoUrl);
const fileCollectionName = 'archivos';
const filesProperty = 'archivosAdjuntos';


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

// *** OBTENER LISTADO DE ARCHIVOS DE UNA COLECCION ***
router.get('/document-files', async (req, res) => {
  // let clientConnection;
  try {
    const { collection, documentId } = req.query;
    if (!collection || !documentId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    console.log('collection:', collection);
    console.log('documentId:', documentId);
    console.log('filesProperty:', filesProperty);

    // await client.connect();
    clientConnection = await client.connect();
    console.log('Connected to MongoDB');

    let document;

    switch (collection) {
      case 'actores':
        document = await Actor.findById(documentId);
        break;
      case 'generos':
        document = await Genero.findById(documentId);
        break;
      case 'generosNoMusicales':
        document = await GeneroNoMusical.findById(documentId);
        break;
      case 'instrumentos':
        document = await Instrumento.findById(documentId);
        break;
      case 'materias':
        document = await Materia.findById(documentId);
        break;
      case 'medios':
        document = await Medio.findById(documentId);
        break;
      case 'obras':
        document = await Obra.findById(documentId);
        break;
      case 'proyectos':
        document = await Proyecto.findById(documentId);
        break;
      case 'recursos':
        document = await Recurso.findById(documentId);
        break;
      case 'sistemas':
        document = await Sistema.findById(documentId);
        break;
      default:
        return res.status(404).json({ message: 'Not found' });
    }

    // Si se encuentra un documento, verificar la propiedad
    if (document) {
      if (filesProperty in document) {
        const propertyValues = document[filesProperty];
        console.log('propertyValues:', propertyValues);

        if (Array.isArray(propertyValues)) {
          const documentFiles = [];
          const limit = 100; // Ajusta este límite según tus necesidades

          for (let i = 0; i < Math.min(propertyValues.length, limit); i++) {
            const fileId = propertyValues[i];
            console.log('fileId (filesProperty values):', fileId);

            try {
              // const myFile = await archivosCollection.findOne({ _id: fileId._id });
              const myFile = await Archivo.findOne({ _id: fileId._id });
              console.log('myFile:', myFile);

              const myFileProcessed = {
                name: myFile.minioObjectName,
                size: myFile.size,
                lastModified: myFile.uploadDate,
                id: myFile._id
              }

              documentFiles.push(myFileProcessed);

            } catch (error) {
              console.error(`Error processing file with id ${fileId}:`, error);
              // Decide si quieres continuar con el siguiente archivo o lanzar el error
            }
          }

          console.log('documentFiles:', documentFiles);

          return res.json(documentFiles);
        }
      } else {
        return res.status(404).json({ message: 'Property not found in document' });
      }
    } else {
      return res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (clientConnection) await clientConnection.close();
    // await client.close();
  }
});
// *** (Fin de OBTENER LISTADO DE ARCHIVOS DE UNA COLECCION) ***


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

    // Crear el objeto de respuesta con la información requerida
    const fileData = {
      filename: req.file.filename || objectName, // Si multer no genera un filename, usamos objectName
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      minioObjectName: objectName
    };

    const result = await Archivo.create(fileData);
    console.log('result (server)', result);
    const documentId = result._id;
    // const documentId = result.insertedId;
    console.log(`Documento insertado con el id: ${documentId}`);

    res.status(200).json({
      message: 'Archivo subido con éxito',
      fileData: fileData,
      documentId: documentId
    });
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
router.delete('/:fileName', async (req, res) => {
  console.log("Entering Delete!!!");
  try {
    console.log('entrando a delete');
    console.log('req.params:', req.params);
    console.log('\n\n(delete)req.body:', req.body);
    console.log('\n\n');

    if (!req.params.fileName) {
      return res.status(400).json({ message: 'Se requiere un nombre de archivo' });
    }

    const objectName = req.params.fileName;
    await minioClient.removeObject(myBucketName, objectName);

    if (req.body.fileInfo) {
      const { id, documentId } = req.body.fileInfo;
      console.log('id:', id, 'documentId:', documentId);
      clientConnection = await client.connect();
      const db = clientConnection.db(dbName);
      console.log('Connected to MongoDB');
      const fileDoc = await Archivo.findOne({ _id: id });

      if (!fileDoc) {
        throw new Error('Archivo no encontrado en la base de datos');
      }

      // Eliminar el documento de la colección "archivos"
      await Archivo.deleteOne({ _id: id });

      if (id && documentId) {
        // Actualizar todas las colecciones que tengan referencias al archivo
        const collections = await db.listCollections().toArray();

        // Convertir archivoId a ObjectId si es necesario
        const fileObjectId = new mongoose.Types.ObjectId(id);

        for (const collectionInfo of collections) {
          const collection = db.collection(collectionInfo.name);
          console.log('\ncollection:', collectionInfo);

          if (filesProperty in collectionInfo) {
            console.log('\n\ncollection has filesProperty:', collectionInfo.name);
          }

          // Actualizar documentos que tengan el archivo en "archivosAdjuntos"
          try {
            const documentosConArchivo = await collection.find({ archivosAdjuntos: fileObjectId }).toArray();
            console.log(`Documentos con el archivo en la colección ${collectionInfo.name}:`, documentosConArchivo);

            const result = await collection.updateMany(
              { archivosAdjuntos: { $elemMatch: { _id: fileObjectId } } },  // Usar $elemMatch para encontrar el archivo en el array
              { $pull: { archivosAdjuntos: { _id: fileObjectId } } }  // Usar $pull con el objeto completo a eliminar
            );

            console.log('result.modifiedCount:', result.modifiedCount);
            if (result.modifiedCount > 0) {
              console.log(`Referencias al archivo eliminadas en la colección ${collectionInfo.name}`);
            }
          } catch (error) {
            console.error(`Error al actualizar la colección ${collectionInfo.name}:`, error);
          }
        }
      }
    }

    res.status(200).json({ message: 'Archivo eliminado con éxito' });

  } catch (error) {
    console.error('Error al eliminar el archivo y sus referencias:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo y sus referencias' });
    throw error;
  } finally {
    if (clientConnection) await clientConnection.close();
  }
});

// *** ELIMINAR MULTIPLES ARCHIVOS ***
// Ruta para eliminar multiples archivos
router.post('/delete-multiple', async (req, res) => {
  let clientConnection;
  try {
    console.log('Entrando a delete-multiple');
    console.log('req.body:', req.body);

    if (!req.body.files || !Array.isArray(req.body.files)) {
      return res.status(400).json({ message: 'Se requiere un array de información de archivos' });
    }

    const files = req.body.files;
    const deletionResults = [];
    let hasErrors = false;

    // Conectar a MongoDB una sola vez
    clientConnection = await client.connect();
    const db = clientConnection.db(dbName);

    // Obtener la lista de colecciones una sola vez
    const collections = await db.listCollections().toArray();

    // Procesar cada archivo
    for (const file of files) {
      try {
        const { fileName, id, documentId } = file;

        // 1. Eliminar archivo de MinIO
        await minioClient.removeObject(myBucketName, fileName);

        if (id) {
          // 2. Eliminar documento de la colección "archivos"
          const fileDoc = await Archivo.findOne({ _id: id });
          if (fileDoc) {
            await Archivo.deleteOne({ _id: id });

            // 3. Actualizar referencias en otras colecciones
            const fileObjectId = new mongoose.Types.ObjectId(id);

            for (const collectionInfo of collections) {
              const collection = db.collection(collectionInfo.name);

              try {
                const result = await collection.updateMany(
                  { archivosAdjuntos: { $elemMatch: { _id: fileObjectId } } },
                  { $pull: { archivosAdjuntos: { _id: fileObjectId } } }
                );

                if (result.modifiedCount > 0) {
                  console.log(`Referencias al archivo ${fileName} eliminadas en la colección ${collectionInfo.name}`);
                }
              } catch (error) {
                console.error(`Error al actualizar referencias en la colección ${collectionInfo.name}:`, error);
              }
            }
          }
        }

        deletionResults.push({
          fileName,
          success: true,
          message: 'Archivo eliminado con éxito'
        });

      } catch (error) {
        hasErrors = true;
        deletionResults.push({
          fileName: file.fileName,
          success: false,
          message: error.message || 'Error al eliminar el archivo'
        });
      }
    }

    // Responder con los resultados
    if (hasErrors) {
      res.status(207).json({
        message: 'Algunos archivos no pudieron ser eliminados',
        results: deletionResults
      });
    } else {
      res.status(200).json({
        message: 'Todos los archivos fueron eliminados con éxito',
        results: deletionResults
      });
    }

  } catch (error) {
    console.error('Error general en la eliminación múltiple:', error);
    res.status(500).json({
      message: 'Error en el servidor al procesar la eliminación múltiple',
      error: error.message
    });
  } finally {
    if (clientConnection) {
      await clientConnection.close();
    }
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