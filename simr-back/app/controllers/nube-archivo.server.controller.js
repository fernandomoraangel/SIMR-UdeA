'use strict';

const mongoose = require('mongoose');
const NubeArchivo = mongoose.model('NubeArchivo');
const path = require('path');
const crypto = require('crypto');

const { successResponse, errorResponse } = require('../../utils/responseHelpers');

// Referencia al cliente MinIO y bucket desde minio.js (se inyectan en rutas)
let _minioClient = null;
let _bucketName = null;

function setMinio(client, bucket) {
  _minioClient = client;
  _bucketName = bucket;
}

const DEFAULT_MAX_SIZE = 200 * 1024 * 1024; // 200 MB

// Obtener tamaño máximo desde el documento de configuración
async function getMaxFileSize() {
  try {
    const NubeConfig = mongoose.model('NubeConfig');
    const config = await NubeConfig.findOne({});
    return config?.maxFileSize || DEFAULT_MAX_SIZE;
  } catch {
    return DEFAULT_MAX_SIZE;
  }
}

//* LIST - Listar archivos con filtro opcional por tags
async function list(req, res) {
  try {
    const { tags, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length) {
        filter.tags = { $in: tagList };
      }
    }

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { originalName: re },
        { tags: re },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await NubeArchivo.countDocuments(filter);
    const files = await NubeArchivo.find(filter)
      .populate('uploadedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    successResponse(res, 'Archivos listados', 200, { files, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[nube-archivo] list error:', err);
    errorResponse(res, 'Error al listar archivos', 500);
  }
}

//* UPLOAD - Subir archivo
async function upload(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se ha enviado ningún archivo', 400);
    }

    // Validar contra tamaño máximo configurable
    const maxSize = await getMaxFileSize();
    if (req.file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return errorResponse(res, `El archivo excede el tamaño máximo permitido de ${maxMB} MB`, 413);
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const tags = req.body.tags
      ? req.body.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    // Generar key única
    const ext = path.extname(originalname);
    const key = `${crypto.randomUUID()}${ext}`;

    // Subir a MinIO
    await _minioClient.putObject(_bucketName, key, buffer, size, {
      'Content-Type': mimetype,
    });

    // Guardar metadatos
    const doc = await NubeArchivo.create({
      originalName: originalname,
      mimetype,
      size,
      key,
      tags,
      uploadedBy: req.user._id,
    });

    await doc.populate('uploadedBy', 'username fullName');

    successResponse(res, 'Archivo subido exitosamente', 201, doc);
  } catch (err) {
    console.error('[nube-archivo] upload error:', err);
    errorResponse(res, 'Error al subir archivo', 500);
  }
}

//* READ - Obtener metadatos de un archivo
async function read(req, res) {
  try {
    const doc = await NubeArchivo.findById(req.params.id)
      .populate('uploadedBy', 'username fullName');
    if (!doc) {
      return errorResponse(res, 'Archivo no encontrado', 404);
    }
    successResponse(res, 'Archivo encontrado', 200, doc);
  } catch (err) {
    console.error('[nube-archivo] read error:', err);
    errorResponse(res, 'Error al obtener archivo', 500);
  }
}

//* DOWNLOAD - Descargar archivo desde MinIO
async function download(req, res) {
  try {
    const doc = await NubeArchivo.findById(req.params.id);
    if (!doc) {
      return errorResponse(res, 'Archivo no encontrado', 404);
    }

    const stream = await _minioClient.getObject(_bucketName, doc.key);
    res.setHeader('Content-Type', doc.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    res.setHeader('Content-Length', doc.size);
    stream.pipe(res);
  } catch (err) {
    console.error('[nube-archivo] download error:', err);
    errorResponse(res, 'Error al descargar archivo', 500);
  }
}

//* UPDATE TAGS - Actualizar tags de un archivo
async function updateTags(req, res) {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return errorResponse(res, 'tags debe ser un arreglo de strings', 400);
    }

    const doc = await NubeArchivo.findByIdAndUpdate(
      req.params.id,
      { tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean), updatedAt: new Date() },
      { new: true }
    ).populate('uploadedBy', 'username fullName');

    if (!doc) {
      return errorResponse(res, 'Archivo no encontrado', 404);
    }
    successResponse(res, 'Tags actualizados', 200, doc);
  } catch (err) {
    console.error('[nube-archivo] updateTags error:', err);
    errorResponse(res, 'Error al actualizar tags', 500);
  }
}

//* UPDATE COLOR - Actualizar el color de la tarjeta de un archivo
async function updateColor(req, res) {
  try {
    const { color } = req.body;
    const cleanColor = typeof color === 'string' ? color.trim() : '';
    if (cleanColor && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(cleanColor)) {
      return errorResponse(res, 'color debe ser un color hexadecimal o vacío', 400);
    }

    const doc = await NubeArchivo.findByIdAndUpdate(
      req.params.id,
      { color: cleanColor, updatedAt: new Date() },
      { new: true }
    ).populate('uploadedBy', 'username fullName');

    if (!doc) {
      return errorResponse(res, 'Archivo no encontrado', 404);
    }
    successResponse(res, 'Color actualizado', 200, doc);
  } catch (err) {
    console.error('[nube-archivo] updateColor error:', err);
    errorResponse(res, 'Error al actualizar color', 500);
  }
}

//* DELETE - Eliminar archivo
async function remove(req, res) {
  try {
    const doc = await NubeArchivo.findById(req.params.id);
    if (!doc) {
      return errorResponse(res, 'Archivo no encontrado', 404);
    }

    // Eliminar de MinIO
    try {
      await _minioClient.removeObject(_bucketName, doc.key);
    } catch (minioErr) {
      console.warn('[nube-archivo] MinIO remove warning:', minioErr.message);
    }

    await NubeArchivo.deleteOne({ _id: doc._id });
    successResponse(res, 'Archivo eliminado', 200);
  } catch (err) {
    console.error('[nube-archivo] delete error:', err);
    errorResponse(res, 'Error al eliminar archivo', 500);
  }
}

//* ALL TAGS - Obtener lista de todos los tags usados
async function allTags(req, res) {
  try {
    const result = await NubeArchivo.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const tags = result.map(r => ({ tag: r._id, count: r.count }));
    successResponse(res, 'Tags obtenidos', 200, tags);
  } catch (err) {
    console.error('[nube-archivo] allTags error:', err);
    errorResponse(res, 'Error al obtener tags', 500);
  }
}

//* GET CONFIG
async function getConfig(req, res) {
  try {
    const NubeConfig = mongoose.model('NubeConfig');
    let config = await NubeConfig.findOne({});
    if (!config) {
      config = await NubeConfig.create({ maxFileSize: DEFAULT_MAX_SIZE });
    }
    successResponse(res, 'Configuración obtenida', 200, {
      maxFileSize: config.maxFileSize,
      maxFileSizeMB: Math.round(config.maxFileSize / (1024 * 1024)),
    });
  } catch (err) {
    console.error('[nube-archivo] getConfig error:', err);
    errorResponse(res, 'Error al obtener configuración', 500);
  }
}

//* UPDATE CONFIG
async function updateConfig(req, res) {
  try {
    const { maxFileSizeMB } = req.body;
    if (!maxFileSizeMB || typeof maxFileSizeMB !== 'number' || maxFileSizeMB < 1) {
      return errorResponse(res, 'maxFileSizeMB debe ser un número mayor a 0', 400);
    }

    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    const NubeConfig = mongoose.model('NubeConfig');
    let config = await NubeConfig.findOne({});
    if (!config) {
      config = await NubeConfig.create({ maxFileSize });
    } else {
      config.maxFileSize = maxFileSize;
      await config.save();
    }

    successResponse(res, 'Configuración actualizada', 200, {
      maxFileSize: config.maxFileSize,
      maxFileSizeMB: Math.round(config.maxFileSize / (1024 * 1024)),
    });
  } catch (err) {
    console.error('[nube-archivo] updateConfig error:', err);
    errorResponse(res, 'Error al actualizar configuración', 500);
  }
}

module.exports = {
  setMinio,
  list,
  upload,
  read,
  download,
  updateTags,
  updateColor,
  remove,
  allTags,
  getConfig,
  updateConfig,
};
