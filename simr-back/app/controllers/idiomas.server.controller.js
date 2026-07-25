'use strict';

const mongoose = require('mongoose');
const { logAudit } = require("../services/audit.service");
const Idioma = mongoose.model('Idioma');
const fs = require('fs');
const path = require('path');

const getErrorMessage = (err) => {
  let message = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'El registro ya existe';
        break;
      default:
        message = 'Se ha producido un error';
    }
  } else {
    for (let errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

exports.create = async (req, res) => {
  try {
    const idioma = new Idioma(req.body);
    idioma.creador = req.user;
    await idioma.save();
    await logAudit(req, "idioma_created", "idioma", idioma._id, idioma.nombre);
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.glottocode) filter.glottocode = req.query.glottocode;
    if (req.query.idioma) filter.idioma = { $regex: req.query.idioma, $options: 'i' };
    const idiomas = await Idioma.find(filter)
      .sort('-creado')
      .populate('creador', 'firstName lastName fullName')
      .exec();
    res.json(idiomas);
  } catch (err) {
    return res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.read = (req, res) => {
  res.json(req.idioma);
};

exports.update = async (req, res) => {
  try {
    const idioma = req.idioma;
    idioma.idioma = req.body.idioma;
    idioma.glottocode = req.body.glottocode;
    idioma.isoCode = req.body.isoCode;
    idioma.endonym = req.body.endonym;
    idioma.exonymSpanish = req.body.exonymSpanish;
    idioma.linguisticFamily = req.body.linguisticFamily;
    idioma.transmissionMode = req.body.transmissionMode;
    idioma.territorialContext = req.body.territorialContext;
    idioma.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
    idioma.descriptorLibre = req.body.descriptorLibre;
    idioma.vinculoRelacionado = req.body.vinculoRelacionado;
    idioma.archivosAdjuntos = req.body.archivosAdjuntos;
    await idioma.save();
    await logAudit(req, "idioma_updated", "idioma", idioma._id, idioma.nombre);
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.delete = async (req, res) => {
  try {
    const idioma = req.idioma;
    await logAudit(req, "idioma_deleted", "idioma", idioma._id, idioma.nombre);
    await idioma.deleteOne();
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({ message: getErrorMessage(err) });
  }
};

exports.idiomaByID = async (req, res, next, id) => {
  try {
    const idioma = await Idioma.findById(id)
      .populate('creador', 'firstName lastName fullName')
      .exec();
    if (!idioma) {
      return next(new Error('Fallo al cargar el idioma: ' + id));
    }
    req.idioma = idioma;
    next();
  } catch (err) {
    return next(err);
  }
};

exports.hasAuthorization = (req, res, next) => {
  if (req.idioma.creador.id !== req.user.id) {
    return res.status(403).send({ message: 'Usuario no autorizado' });
  }
  next();
};

exports.seed = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../data/lenguas-america.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'Archivo de semilla no encontrado' });
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const lenguas = JSON.parse(raw);
    let creadas = 0;
    let existentes = 0;
    let errores = 0;

    for (const lengua of lenguas) {
      try {
        const existing = await Idioma.findOne({
          $or: [
            { glottocode: lengua.glottocode },
            { idioma: lengua.exonymSpanish || lengua.endonym }
          ]
        });
        if (existing) {
          existentes++;
          continue;
        }
        const nuevo = new Idioma({
          idioma: lengua.exonymSpanish || lengua.endonym,
          glottocode: lengua.glottocode,
          isoCode: lengua.isoCode || '',
          endonym: lengua.endonym,
          exonymSpanish: lengua.exonymSpanish || '',
          linguisticFamily: lengua.linguisticFamily,
          territorialContext: '',
        });
        nuevo.creador = req.user;
        await nuevo.save();
        creadas++;
      } catch (err) {
        errores++;
        console.error(`Error creando ${lengua.endonym}:`, err.message);
      }
    }

    res.json({
      message: `Seed completado. Creadas: ${creadas}, Existentes: ${existentes}, Errores: ${errores}`,
      total: lenguas.length,
      creadas,
      existentes,
      errores,
    });
  } catch (err) {
    return res.status(400).send({ message: getErrorMessage(err) });
  }
};
