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
    const { entities, query } = req.query;
    const selectedModels = entities ? entities.split(',') : null;
    const searchQuery = query || '';

    const models = getModelNames();
    const results = await Promise.all(
      models.map(async (m) => {
        if (selectedModels && !selectedModels.includes(m.name.toLowerCase())) {
          return null;
        }

        try {
          const Model = mongoose.model(m.name);
          let filter = {};
          
          if (searchQuery) {
            // Busqueda simple en campos comunes
            filter = {
              $or: [
                { titulo: { $regex: searchQuery, $options: 'i' } },
                { nombre: { $regex: searchQuery, $options: 'i' } },
                { fullName: { $regex: searchQuery, $options: 'i' } },
                { descripcion: { $regex: searchQuery, $options: 'i' } }
              ]
            };
          }
          
          const count = await Model.countDocuments(filter);
          return { key: m.name.toLowerCase(), label: m.label, count };
        } catch {
          return { key: m.name.toLowerCase(), label: m.label, count: 0 };
        }
      })
    );
    res.json(results.filter(r => r !== null));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
