const mongoose = require("mongoose");
const config = require("../config/config");

// Conectar a la base de datos
mongoose.connect(config.db);

// Cargar el modelo
require("../app/models/lista.server.model");
const Lista = mongoose.model("Lista");

const nNormalizadosData = {
  nombre_lista: "nNormalizados",
  elementos: [
    "Depósito legal",
    "DOI - Digital Object Identifier System",
    "ISAN - International Standard Audiovisual Number",
    "ISBN - International Standard Book Number",
    "ISMN - International Standard Music Number",
    "ISRC - International Standard Recording Code",
    "ISSN - International Standard Serial Number",
    "ISWC - International Standard Musical Work Code",
  ],
  metadata: [
    { sigla: "Depósito legal", frase: "" },
    { sigla: "DOI", frase: "Digital Object Identifier System" },
    { sigla: "ISAN", frase: "International Standard Audiovisual Number" },
    { sigla: "ISBN", frase: "International Standard Book Number" },
    { sigla: "ISMN", frase: "International Standard Music Number" },
    { sigla: "ISRC", frase: "International Standard Recording Code" },
    { sigla: "ISSN", frase: "International Standard Serial Number" },
    { sigla: "ISWC", frase: "International Standard Musical Work Code" },
  ],
};

async function insertNNormalizados() {
  try {
    console.log("Conectando a la base de datos...");

    // Verificar si ya existe
    const existing = await Lista.findOne({ nombre_lista: "nNormalizados" });

    if (existing) {
      console.log("Lista nNormalizados ya existe, actualizando...");
      await Lista.findByIdAndUpdate(existing._id, nNormalizadosData);
      console.log("✓ Lista nNormalizados actualizada exitosamente");
      console.log("  - Elementos:", nNormalizadosData.elementos.length);
      console.log("  - Metadata:", nNormalizadosData.metadata.length);
    } else {
      console.log("Creando nueva lista nNormalizados...");
      const lista = new Lista(nNormalizadosData);
      await lista.save();
      console.log("✓ Lista nNormalizados creada exitosamente");
      console.log("  - Elementos:", nNormalizadosData.elementos.length);
      console.log("  - Metadata:", nNormalizadosData.metadata.length);
    }

    // Verificar la lista
    const verificacion = await Lista.findOne({ nombre_lista: "nNormalizados" });
    console.log("\nVerificación:");
    console.log("  - ID:", verificacion._id);
    console.log("  - Nombre:", verificacion.nombre_lista);
    console.log("  - Total elementos:", verificacion.elementos.length);
    console.log("  - Total metadata:", verificacion.metadata.length);

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err);
    mongoose.connection.close();
    process.exit(1);
  }
}

insertNNormalizados();
