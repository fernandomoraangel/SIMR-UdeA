"use strict";

const mongoose = require("mongoose");

const getModelNames = () => [
  { name: "Actor", label: "Actores" },
  { name: "Obra", label: "Obras" },
  { name: "Recurso", label: "Recursos" },
  { name: "Genero", label: "Géneros" },
  { name: "GeneroNoMusical", label: "Géneros no musicales" },
  { name: "Materia", label: "Materias" },
  { name: "Instrumento", label: "Instrumentos" },
  { name: "Proyecto", label: "Proyectos" },
  { name: "Medio", label: "Medios" },
  { name: "Sistema", label: "Sistemas" },
  { name: "Fondo", label: "Fondos" },
  { name: "Coleccion", label: "Colecciones" },
  { name: "Ejemplar", label: "Ejemplares" },
  { name: "Idioma", label: "Idiomas" },
  { name: "Diccionario", label: "Diccionarios" },
  { name: "User", label: "Usuarios" },
];

exports.getAll = async (req, res) => {
  try {
    const models = getModelNames();
    const counts = await Promise.all(
      models.map(async (m) => {
        try {
          const Model = mongoose.model(m.name);
          const count = await Model.countDocuments();
          return { key: m.name.toLowerCase(), label: m.label, count };
        } catch {
          return { key: m.name.toLowerCase(), label: m.label, count: 0 };
        }
      })
    );
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
