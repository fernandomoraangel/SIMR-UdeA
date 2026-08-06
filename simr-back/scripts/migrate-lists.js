#!/usr/bin/env node

/**
 * Script de migración para trasladar las listas hardcodeadas a MongoDB
 * Ejecutar con: node scripts/migrate-lists.js
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");

// Conectar a MongoDB usando la configuración del entorno (config/env/*.js),
// igual que el resto de la aplicación y que scripts/insert-nNormalizados-lista.js.
// En producción resuelve a process.env.MONGO_URI (mongodb://.../simr, host "mongodb"
// dentro de la red de Docker); en desarrollo, a la URI local definida en config/env/development.js.
const connectDB = async () => {
  try {
    console.log("Using MongoDB URI:", config.db);
    await mongoose.connect(config.db);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

// Leer el archivo de listas
const readListasFile = () => {
  try {
    // Usar datos hardcodeados ya que el archivo fue eliminado
    return {
      nNormalizados: [
        { sigla: "Depósito legal", frase: "" },
        { sigla: "DOI", frase: "Digital Object Identifier System" },
        { sigla: "ISAN", frase: "International Standard Audiovisual Number" },
        { sigla: "ISBN", frase: "International Standard Book Number" },
        { sigla: "ISMN", frase: "International Standard Music Number" },
        { sigla: "ISRC", frase: "International Standard Recording Code" },
        { sigla: "ISSN", frase: "International Standard Serial Number" },
        { sigla: "ISWC", frase: "International Standard Musical Work Code" },
      ],
      tipos: [
        "Artículo de revista",
        "Dibujo",
        "Esquema",
        "Fotografía",
        "Grabación audiovisual",
        "Grabación sonora",
        "Lead sheet (partitura con melodía y acordes)",
        "Lead sheet con texto",
        "Libro",
        "Mapa",
        "Partitura general",
        "Partitura individual (particella)",
        "Partitura melódica",
        "Plano",
        "Revista",
        "Software",
        "Partitura manuscrita",
        "",
      ],
      tipoFuente: [
        "Distribuidor",
        "Editor",
        "Estudio de grabación de audio",
        "Fabricante",
        "Grabación de campo",
        "Matriz",
        "Productor",
        "Productora audiovisual",
        "Publicador",
        "Referencia",
        "Sello",
      ],
      criterio: [
        "Archivo tipo Container",
        "Bitrate",
        "Calidad de grabación",
        "Cantidad de canales",
        "Cantidad de pistas de audio",
        "Codec audio",
        "Codec vídeo",
        "Código SPARS",
        "Tipo de grabación (analógico, digital)",
        "Compresión de archivo",
        "Dimensiones físicas (cm)",
        "Duración",
        "Formato (tipo de soporte)",
        "Número de páginas",
        "Profundidad de bits",
        "Profundidad de color",
        "Rata de muestreo",
        "Relación de aspecto",
        "Resolución vídeos e imágenes",
        "Tamaño de archivo",
        "Tipo de archivo",
        "Tipo de cinta",
        "Velocidad de cinta",
        "Velocidad de rotación",
        "Tipo de grabación (profesional, casera, de campo)",
        "Número de unidades físicas del soporte",
        "Código de tiempo de la máquina reproductora",
      ],
      estados: [
        "Archivo corrupto",
        "Cinta deteriorada",
        "Cinta enredada",
        "Depostillado",
        "estuche quebrado",
        "Hongos",
        "Humedad",
        "Incompleto",
        "Inservible",
        "Lévemente deteriorado",
        "Manchas",
        "Marbete rayado o ilegible",
        "Mutilado",
        "Óptimo",
        "Para expurgo",
        "Portada deteriorada o ilegible",
        "Quebrado",
        "Rayado",
        "Sin estuche",
        "Soporte defectuoso",
        "Sucio",
        "Trozos faltantes",
        "Estuche despegado",
        "Estuche roto",
      ],
      disponibilidades: [
        "Disponible",
        "En préstamo",
        "En proceso técnico",
        "Extraviado",
        "Reservado",
        "Restringido",
      ],
      estadosProyecto: [
        "Compromisos pendientes",
        "Ejecución",
        "Formulación",
        "Prorroga",
        "Suspendido",
        "Terminado",
      ],
      dEtiquetas: [
        "Experiencia significativa",
        "Interés pedagógico",
        "Interés general",
        "Obra representativa",
        "Proyecto similar",
        "Relación con línea de investigación",
        "Texto digno de mención",
        "Versión significativa",
      ],
      tiposFondosColecciones: [
        "Archivo de gestión",
        "Archivo digital",
        "Archivo institucional",
        "Archivo personal",
        "Artística",
        "Audiovisual",
        "Contenidos variados",
        "Literaria",
        "Música",
        "Poesía",
        "Software",
        "Teoria",
        "Textos creativos",
        "Visual",
      ],
      familiasLinguisticas: [
        "Aislada / Independiente",
        "Arawak (Maipureana)",
        "Barbacoana",
        "Bora-Witoto",
        "Cahuapana",
        "Caribe",
        "Chibcha",
        "Chocó (Emberá)",
        "Guahibana",
        "Harákmbut-Katukina",
        "Huaorani (Sabela)",
        "Jé (Gê)",
        "Jívaro (Chicham)",
        "Macro-Jê",
        "Maku (Nadahup)",
        "Mataco-Guaicurú",
        "Maya",
        "Misumalpa",
        "Mixteco-Zapoteca (Otomangue)",
        "Murano",
        "Nambikwara",
        "Pano-Tacana",
        "Peba-Yagua",
        "Quechua (Runasimi)",
        "Saliba-Piaroa",
        "Ticuna-Yuri",
        "Timote-Cuica",
        "Tucana",
        "Tupí-Guaraní",
        "Uru-Chipaya",
        "Uto-Azteca",
        "Wakú (Kakwa-Nukak)",
        "Yanomami",
        "Yuki (Yukpa)",
        "Zaparoana",
        "Indoeuropea (Romance / Germánica)",
        "Niger-Congo (Bantú)",
        "Afroasiática (Semítica)",
        "Sino-Tibetana",
        "Japónica",
        "Austronesia",
        "Tai-Kadai",
        "Dravídica",
        "Tungús",
      ],
      modosDeTransmision: [
        "Oral",
        "Escrita",
        "Mixta",
        "Ritual / Esotérica",
        "Señas (Lengua de señas)",
        "Cantada / Performática",
      ],
      lugares: [
        "Amazonía",
        "América",
        "Andes",
        "Argentina",
        "Atlántico",
        "Bolivia",
        "Brasil",
        "Colombia",
        "Iberoamérica",
        "Latinoamérica",
        "Llanos",
        "Medellín",
        "México",
        "Pacífico",
        "Panamá",
        "Paraguay",
        "Perú",
        "Uruguay",
      ],
      coberturas: [
        "América Latina",
        "Ciudad",
        "Continente",
        "Hispanoamérica",
        "Iberoamérica",
        "Local",
        "Mundo",
        "País",
      ],
      rolesMedios: [
        "Acompañante",
        "integrante",
        "Invitado",
        "Opcional",
        "Solista",
        "Solo",
      ],
      roles: [
        "Actor al que se refiere la obra",
        "Adaptación",
        "Arreglista",
        "Arreglo",
        "Autor letra",
        "Autor música",
        "Autor",
        "Beat maker",
        "Compilador",
        "Compositor",
        "Coordinador",
        "Corrector de estilo",
        "Dedicatoria",
        "Diagramación",
        "Digitador (asigna digitaciones a la partitura)",
        "Digitador de partituras",
        "Director",
        "Editor",
        "Grabación",
        "Guionista",
        "Ingeniero de audio",
        "Intérprete",
        "Investigador principal",
        "Investigador",
        "Masterización",
        "Mezcla",
        "Postproducción",
        "Presentador",
        "Producción ejecutiva",
        "Producción",
        "Productor",
        "Prologuista",
        "Revisor",
        "Titular de derechos patrimoniales",
        "Traductor",
        "Transcripcion (para determinado instrumento)",
        "Transcripción sonora de textos",
        "Transcripción sonora-musical",
        "Transcripción-traducción",
        "Transcriptor de la partitura",
        "Versión",
      ],
    };
  } catch (error) {
    console.error("❌ Error procesando datos de listas:", error);
    process.exit(1);
  }
};

// Modelo de Lista: se reutiliza el esquema real de la aplicación en vez de
// definir uno temporal, para evitar divergencias con app/models/lista.server.model.js
require("../app/models/lista.server.model");
const Lista = mongoose.model("Lista");

// Modelo de Diccionario para seed de definiciones
require("../app/models/diccionario.server.model");
const Diccionario = mongoose.model("Diccionario");

// Función para migrar listas simples (arrays de strings)
const migrateSimpleList = async (nombreLista, elementos) => {
  try {
    // Verificar si ya existe
    const existing = await Lista.findOne({ nombre_lista: nombreLista });
    if (existing) {
      console.log(`⚠️  Lista '${nombreLista}' ya existe, omitiendo...`);
      return;
    }

    // Filtrar elementos vacíos y crear la lista
    const elementosFiltrados = elementos.filter((el) => el && el.trim() !== "");

    const nuevaLista = new Lista({
      nombre_lista: nombreLista,
      elementos: elementosFiltrados,
      metadata: null,
    });

    await nuevaLista.save();
    console.log(
      `✅ Migrada lista '${nombreLista}' con ${elementosFiltrados.length} elementos`
    );
  } catch (error) {
    console.error(`❌ Error migrando lista '${nombreLista}':`, error);
  }
};

// Función para migrar lista compleja (nNormalizados)
const migrateComplexList = async (nombreLista, elementos) => {
  try {
    // Verificar si ya existe
    const existing = await Lista.findOne({ nombre_lista: nombreLista });
    if (existing) {
      console.log(`⚠️  Lista '${nombreLista}' ya existe, omitiendo...`);
      return;
    }

    // Convertir objetos a strings para elementos
    const elementosStrings = elementos.map((item) => item.sigla || item);

    const nuevaLista = new Lista({
      nombre_lista: nombreLista,
      elementos: elementosStrings,
      metadata: elementos, // Guardar la estructura completa en metadata
    });

    await nuevaLista.save();
    console.log(
      `✅ Migrada lista compleja '${nombreLista}' con ${elementosStrings.length} elementos`
    );
  } catch (error) {
    console.error(`❌ Error migrando lista compleja '${nombreLista}':`, error);
  }
};

// Diccionario de definiciones para el módulo Idiomas
const DEFINICIONES_IDIOMAS = [
  {
    tabla: 'idiomas',
    campo: 'glottocode',
    campoLargo: 'Código Glottolog',
    definicion: 'Código único de 8 caracteres asignado por Glottolog (Instituto Max Planck) para identificar lenguas, dialectos y variedades lingüísticas a nivel mundial. Es el estándar más robusto para lenguas indígenas, amenazadas y poco documentadas. Ej: yucu1253 para el Yukpa.',
  },
  {
    tabla: 'idiomas',
    campo: 'isoCode',
    campoLargo: 'Código ISO 639-3',
    definicion: 'Código de tres letras del estándar ISO 639-3 para identificación de lenguas. Útil para interoperabilidad con sistemas informáticos globales. Opcional para lenguas o variedades no catalogadas. Ej: yup para el Yukpa.',
  },
  {
    tabla: 'idiomas',
    campo: 'endonym',
    campoLargo: 'Endónimo (autodenominación)',
    definicion: 'Nombre con el que el pueblo denomina su propia lengua en su grafía originaria o transcripción fonética. Para lenguas predominantemente orales, se usa una transcripción aproximada. Ej: Wayuunaiki (wayúu), Runa Simi (quechua).',
  },
  {
    tabla: 'idiomas',
    campo: 'exonymSpanish',
    campoLargo: 'Exónimo (español)',
    definicion: 'Nombre histórico, colonial o de uso común en español para referirse a la lengua. Facilita la búsqueda y referencia cruzada desde la bibliografía occidental. Ej: Guajiro (para Wayuunaiki), Quechua (para Runa Simi).',
  },
  {
    tabla: 'idiomas',
    campo: 'linguisticFamily',
    campoLargo: 'Familia lingüística',
    definicion: 'Clasificación genealógica de la lengua según su origen y parentesco con otras lenguas. Se usa la taxonomía de Glottolog como referencia. Ej: Arawak, Chibcha, Quechua, Tupí-Guaraní.',
  },
  {
    tabla: 'idiomas',
    campo: 'transmissionMode',
    campoLargo: 'Modo de transmisión',
    definicion: 'Naturaleza predominante de la transmisión de la lengua. Las lenguas indígenas y tradicionales suelen ser predominantemente orales o performativas. Valores: Oral, Escrita, Mixta, Ritual/Esotérica, Señas, Cantada/Performática.',
  },
  {
    tabla: 'idiomas',
    campo: 'territorialContext',
    campoLargo: 'Contexto territorial',
    definicion: 'Región biocultural, cuenca, territorio ancestral o área geográfica de referencia donde se habla o habló la lengua. Evita la reducción exclusiva a fronteras de Estado-Nación. Ej: Sierra Nevada de Santa Marta, Cuenca del Amazonas, Gran Chaco.',
  },
];

// Función para migrar definiciones del Diccionario
const migrateDiccionarios = async (definiciones) => {
  for (const def of definiciones) {
    try {
      const existing = await Diccionario.findOne({ tabla: def.tabla, campo: def.campo });
      if (existing) {
        console.log(`⚠️  Diccionario '${def.tabla}.${def.campo}' ya existe, omitiendo...`);
        continue;
      }
      await new Diccionario(def).save();
      console.log(`✅ Diccionario '${def.tabla}.${def.campo}' — ${def.campoLargo}`);
    } catch (err) {
      console.error(`❌ Error en diccionario '${def.tabla}.${def.campo}':`, err);
    }
  }
};

// Función principal de migración
const migrateLists = async () => {
  try {
    console.log("🚀 Iniciando migración de listas...\n");

    const listas = readListasFile();

    // Migrar listas simples
    await migrateSimpleList("tipos", listas.tipos);
    await migrateSimpleList("tipoFuente", listas.tipoFuente);
    await migrateSimpleList("criterio", listas.criterio);
    await migrateSimpleList("estados", listas.estados);
    await migrateSimpleList("disponibilidades", listas.disponibilidades);
    await migrateSimpleList("estadosProyecto", listas.estadosProyecto);
    await migrateSimpleList("dEtiquetas", listas.dEtiquetas);
    await migrateSimpleList(
      "tiposFondosColecciones",
      listas.tiposFondosColecciones
    );
    await migrateSimpleList("lugares", listas.lugares);
    await migrateSimpleList("coberturas", listas.coberturas);
    await migrateSimpleList("roles", listas.roles);
    await migrateSimpleList("rolesMedios", listas.rolesMedios);
    await migrateSimpleList("familiasLinguisticas", listas.familiasLinguisticas);
    await migrateSimpleList("modosDeTransmision", listas.modosDeTransmision);

    // Migrar lista compleja
    await migrateComplexList("nNormalizados", listas.nNormalizados);

    // Migrar definiciones del Diccionario para el módulo Idiomas
    await migrateDiccionarios(DEFINICIONES_IDIOMAS);

    console.log("\n✅ Migración completada exitosamente!");
    console.log("📋 Listas migradas:");
    console.log("   - tipos");
    console.log("   - tipoFuente");
    console.log("   - criterio");
    console.log("   - estados");
    console.log("   - disponibilidades");
    console.log("   - estadosProyecto");
    console.log("   - dEtiquetas");
    console.log("   - tiposFondosColecciones");
    console.log("   - lugares");
    console.log("   - coberturas");
    console.log("   - roles");
    console.log("   - rolesMedios");
    console.log("   - nNormalizados (compleja)");
    console.log("   - familiasLinguisticas");
    console.log("   - modosDeTransmision");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await migrateLists();
  await mongoose.disconnect();
  console.log("🔌 Desconectado de MongoDB");
  process.exit(0);
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { migrateLists };
