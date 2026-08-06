"use strict";

const ExcelJS = require("exceljs");
const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");

const ANOTACION_CT_SUBFIELDS = [
  { name: "lugar", label: "Lugar" },
  { name: "coordenadas", label: "Coordenadas (lat, lng)" },
  { name: "evento", label: "Evento" },
  { name: "coberturaAmplitud", label: "Cobertura/Amplitud", list: "coberturas" },
  { name: "fechaInicio", label: "Fecha inicio" },
  { name: "fechaFin", label: "Fecha fin" },
  { name: "precisionInicio", label: "Precisión inicio" },
  { name: "precisionFin", label: "Precisión fin" },
  { name: "evidencia", label: "Evidencia" },
];

const ENTITY_SCHEMA = {
  Obra: {
    label: "Obra",
    order: 15,
    fields: {
      titulo: { label: "Título", type: "string", main: true },
      tipo: { label: "Tipo de obra", type: "string", list: "tipos" },
      descripcion: { label: "Descripción", type: "text" },
      denominacionRegional: { label: "Denominación regional", type: "string", compoundFields: [
        { name: "denominacionRegional", label: "Denominación" },
        { name: "fuenteDenominacion", label: "Fuente de la denominación" },
      ] },
      asientoLigado: { label: "Asiento ligado", type: "string", compoundFields: [
        { name: "id", label: "Obra ligada", refEntity: "Obra" },
        { name: "tipoDeRelacion", label: "Tipo de relación" },
        { name: "direccionDeRelacion", label: "Dirección de la relación" },
        { name: "fuenteAutorRelacion", label: "Fuente autor de la relación" },
        { name: "notaGeneral", label: "Nota general" },
        { name: "proyectoRelacionado", label: "Proyecto relacionado", refEntity: "Proyecto" },
      ] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      descriptores: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculosRelacionados: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
      idiomas: { label: "Idiomas", type: "string", isRef: true, refEntity: "Idioma", refDisplayLabel: "Idioma" },
      actores: { label: "Actores", type: "string", isRef: true, refEntity: "Actor", refDisplayLabel: "Actor" },
      materias: { label: "Materias", type: "string", isRef: true, refEntity: "Materia", refDisplayLabel: "Materia" },
      generosFormas: { label: "Géneros/Formas", type: "string", isRef: true, refEntity: "Genero", refDisplayLabel: "Género" },
      GenerosFormasNoMusicales: { label: "Géneros/Formas no musicales", type: "string", isRef: true, refEntity: "GeneroNoMusical", refDisplayLabel: "Género no musical" },
      mediosSonoros: { label: "Medios sonoros", type: "string", isRef: true, refEntity: "Medio", refDisplayLabel: "Medio" },
      sistemasSonoros: { label: "Sistemas sonoros", type: "string", isRef: true, refEntity: "Sistema", refDisplayLabel: "Sistema" },
      proyectos: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      contenedores: { label: "Contenedores", type: "string", isRef: true, refEntity: "Obra", refDisplayLabel: "Obra" },
    },
    refs: [
      { field: "idiomas", refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", single: false },
      { field: "actores", refEntity: "Actor", searchField: "nombres", displayLabel: "Actor", single: false },
      { field: "materias", refEntity: "Materia", searchField: "nombre", displayLabel: "Materia", single: false },
      { field: "generosFormas", refEntity: "Genero", searchField: "nombre", displayLabel: "Género", single: false },
      { field: "GenerosFormasNoMusicales", refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical", single: false },
      { field: "mediosSonoros", refEntity: "Medio", searchField: "nombre", displayLabel: "Medio", single: false },
      { field: "sistemasSonoros", refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema", single: false },
      { field: "proyectos", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
      { field: "contenedores", refEntity: "Obra", searchField: "titulo", displayLabel: "Obra", single: false },
    ],
  },
  Actor: {
    label: "Actor",
    order: 12,
    fields: {
      nombres: { label: "Nombres", type: "string", main: true },
      apellidos: { label: "Apellidos", type: "string", main: true },
      nombreArtistico: { label: "Nombre artístico", type: "string" },
      nombreReunion: { label: "Nombre de reunión", type: "string" },
      contenedor: { label: "Contenedores", type: "string", isRef: true, refEntity: "Actor", refDisplayLabel: "Actor" },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      descriptores: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "contenedor", refEntity: "Actor", searchField: "nombres", displayLabel: "Actor", single: false },
    ],
  },
  Recurso: {
    label: "Recurso",
    order: 13,
    fields: {
      titulo: { label: "Título", type: "string", main: true },
      faceta: { label: "Faceta", type: "string", list: "tipos" },
      descripcion: { label: "Descripción", type: "text" },
      materialAcompanante: { label: "Material acompañante", type: "string" },
      mencionDeSerie: { label: "Mención de serie", type: "string" },
      numeroNormalizado: { label: "Número normalizado", type: "string", compoundFields: [
        { name: "nombre", label: "Nombre del normalizado", list: "nNormalizados" },
        { name: "numero", label: "Número" },
      ] },
      mencionResponsabilidad: { label: "Mención de responsabilidad", type: "string", compoundFields: [
        { name: "actor", label: "Actor", refEntity: "Actor" },
        { name: "tipoDeMencion", label: "Tipo de mención" },
      ] },
      fuente: { label: "Fuente", type: "string", compoundFields: [
        { name: "tipoFuente", label: "Tipo de fuente", list: "tipoFuente" },
        { name: "lugar", label: "Lugar" },
        { name: "nombre", label: "Nombre" },
        { name: "fecha", label: "Fecha" },
        { name: "precision", label: "Precisión de fecha" },
      ] },
      descripcionTecnica: { label: "Descripción técnica", type: "string", compoundFields: [
        { name: "criterio", label: "Criterio", list: "criterio" },
        { name: "valor", label: "Valor" },
      ] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      obrasRelacionadas: { label: "Obras relacionadas", type: "string", isRef: true, refEntity: "Obra", refDisplayLabel: "Obra" },
      contenedores: { label: "Contenedores", type: "string", isRef: true, refEntity: "Recurso", refDisplayLabel: "Recurso" },
      idiomas: { label: "Idiomas", type: "string", isRef: true, refEntity: "Idioma", refDisplayLabel: "Idioma" },
      materia: { label: "Materias", type: "string", isRef: true, refEntity: "Materia", refDisplayLabel: "Materia" },
      proyectos: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
      tiposDeRecurso: { label: "Tipos de recurso", type: "string", list: "tipos" },
    },
    refs: [
      { field: "obrasRelacionadas", refEntity: "Obra", searchField: "titulo", displayLabel: "Obra", single: false },
      { field: "contenedores", refEntity: "Recurso", searchField: "titulo", displayLabel: "Recurso", single: false },
      { field: "idiomas", refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", single: false },
      { field: "materia", refEntity: "Materia", searchField: "nombre", displayLabel: "Materia", single: false },
      { field: "proyectos", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
    ],
  },
  Instrumento: {
    label: "Instrumento",
    order: 7,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      clasificacion: { label: "Clasificación HS", type: "string" },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      proyectosAsociados: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "proyectosAsociados", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
    ],
  },
  Sistema: {
    label: "Sistema Sonoro",
    order: 9,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      sistemasRelacionados: { label: "Sistemas relacionados", type: "string", isRef: true, refEntity: "Sistema", refDisplayLabel: "Sistema" },
      padres: { label: "Sistemas padre", type: "string", isRef: true, refEntity: "Sistema", refDisplayLabel: "Sistema" },
      hijos: { label: "Sistemas hijo", type: "string", isRef: true, refEntity: "Sistema", refDisplayLabel: "Sistema" },
      proyectosAsociados: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "sistemasRelacionados", refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema relacionado", single: false },
      { field: "padres", refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema padre", single: false },
      { field: "hijos", refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema hijo", single: false },
      { field: "proyectosAsociados", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
    ],
  },
  Medio: {
    label: "Medio Sonoro",
    order: 8,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      instrumentos: { label: "Instrumentos", type: "string", isRef: true, refEntity: "Instrumento", refDisplayLabel: "Instrumento" },
      proyectosAsociados: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "instrumentos", refEntity: "Instrumento", searchField: "nombre", displayLabel: "Instrumento", single: false },
      { field: "proyectosAsociados", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
    ],
  },
  Genero: {
    label: "Género / Forma",
    order: 11,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      GeneroRelacionado: { label: "Géneros relacionados", type: "string", isRef: true, refEntity: "Genero", refDisplayLabel: "Género" },
      padres: { label: "Géneros padre", type: "string", isRef: true, refEntity: "Genero", refDisplayLabel: "Género" },
      hijos: { label: "Géneros hijo", type: "string", isRef: true, refEntity: "Genero", refDisplayLabel: "Género" },
      idioma: { label: "Idiomas", type: "string", isRef: true, refEntity: "Idioma", refDisplayLabel: "Idioma" },
      sistemasSonoros: { label: "Sistemas sonoros", type: "string", isRef: true, refEntity: "Sistema", refDisplayLabel: "Sistema" },
      mediosSonoros: { label: "Medios sonoros", type: "string", isRef: true, refEntity: "Medio", refDisplayLabel: "Medio" },
      proyectosAsociados: { label: "Proyectos", type: "string", isRef: true, refEntity: "Proyecto", refDisplayLabel: "Proyecto" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "GeneroRelacionado", refEntity: "Genero", searchField: "nombre", displayLabel: "Género relacionado", single: false },
      { field: "padres", refEntity: "Genero", searchField: "nombre", displayLabel: "Género padre", single: false },
      { field: "hijos", refEntity: "Genero", searchField: "nombre", displayLabel: "Género hijo", single: false },
      { field: "idioma", refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", single: false },
      { field: "sistemasSonoros", refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema", single: false },
      { field: "mediosSonoros", refEntity: "Medio", searchField: "nombre", displayLabel: "Medio", single: false },
      { field: "proyectosAsociados", refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", single: false },
    ],
  },
  GeneroNoMusical: {
    label: "Género No Musical",
    order: 10,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      generosRelacionados: { label: "Géneros relacionados", type: "string", isRef: true, refEntity: "GeneroNoMusical", refDisplayLabel: "Género no musical" },
      padres: { label: "Géneros padre", type: "string", isRef: true, refEntity: "GeneroNoMusical", refDisplayLabel: "Género no musical" },
      hijos: { label: "Géneros hijo", type: "string", isRef: true, refEntity: "GeneroNoMusical", refDisplayLabel: "Género no musical" },
      idioma: { label: "Idiomas", type: "string", isRef: true, refEntity: "Idioma", refDisplayLabel: "Idioma" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "generosRelacionados", refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical relacionado", single: false },
      { field: "padres", refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical padre", single: false },
      { field: "hijos", refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical hijo", single: false },
      { field: "idioma", refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", single: false },
    ],
  },
  Materia: {
    label: "Materia",
    order: 6,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      alias: { label: "Alias", type: "string", compoundFields: [{ name: "nombre", label: "Alias" }] },
      materiasRelacionadas: { label: "Materias relacionadas", type: "string", isRef: true, refEntity: "Materia", refDisplayLabel: "Materia" },
      padres: { label: "Materias padre", type: "string", isRef: true, refEntity: "Materia", refDisplayLabel: "Materia" },
      hijos: { label: "Materias hijo", type: "string", isRef: true, refEntity: "Materia", refDisplayLabel: "Materia" },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "materiasRelacionadas", refEntity: "Materia", searchField: "nombre", displayLabel: "Materia relacionada", single: false },
      { field: "padres", refEntity: "Materia", searchField: "nombre", displayLabel: "Materia padre", single: false },
      { field: "hijos", refEntity: "Materia", searchField: "nombre", displayLabel: "Materia hijo", single: false },
    ],
  },
  Fondo: {
    label: "Fondo",
    order: 2,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      tipo: { label: "Tipo", type: "string", list: "tiposFondosColecciones" },
      propiedadComodato: { label: "Propiedad/Comodato", type: "string" },
      fechaDeCreacion: { label: "Fecha de creación", type: "date" },
      precision: { label: "Precisión", type: "string" },
    },
    refs: [],
  },
  Coleccion: {
    label: "Colección",
    order: 3,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      tipo: { label: "Tipo", type: "string", list: "tiposFondosColecciones" },
      propiedadComodato: { label: "Propiedad/Comodato", type: "string" },
      fechaDeCreacion: { label: "Fecha de creación", type: "date" },
      precision: { label: "Precisión", type: "string" },
    },
    refs: [],
  },
  Proyecto: {
    label: "Proyecto",
    order: 14,
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      estado: { label: "Estado", type: "string", list: "estadosProyecto" },
      investigadores: { label: "Investigadores", type: "string", isRef: true, refEntity: "Actor", refDisplayLabel: "Actor" },
      fechasAsociadas: { label: "Fechas asociadas", type: "string", compoundFields: [
        { name: "fecha", label: "Fecha" },
        { name: "evento", label: "Evento" },
        { name: "precision", label: "Precisión" },
      ] },
      descriptoresLibres: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [
      { field: "investigadores", refEntity: "Actor", searchField: "nombres", displayLabel: "Actor", single: false },
    ],
  },
  Idioma: {
    label: "Idioma",
    order: 5,
    fields: {
      idioma: { label: "Idioma", type: "string", main: true },
      glottocode: { label: "Glottocode", type: "string" },
      isoCode: { label: "Código ISO", type: "string" },
      endonym: { label: "Endónimo", type: "string" },
      exonymSpanish: { label: "Exónimo (Español)", type: "string" },
      linguisticFamily: { label: "Familia lingüística", type: "string", list: "familiasLinguisticas" },
      transmissionMode: { label: "Modo de transmisión", type: "string", list: "modosDeTransmision" },
      territorialContext: { label: "Contexto territorial", type: "string", list: "lugares" },
      anotacionCartograficoTemporal: { label: "Anotación cartográfico-temporal", type: "string", compoundFields: ANOTACION_CT_SUBFIELDS },
      descriptorLibre: { label: "Descriptores", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta" },
        { name: "contenido", label: "Contenido" },
      ] },
      vinculoRelacionado: { label: "Vínculos", type: "string", compoundFields: [
        { name: "url", label: "URL" },
        { name: "etiqueta", label: "Etiqueta" },
      ] },
    },
    refs: [],
  },
  Ejemplar: {
    label: "Ejemplar",
    order: 4,
    fields: {
      numeroEjemplar: { label: "Número de ejemplar", type: "string", main: true },
      disponibilidad: { label: "Disponibilidad", type: "string", list: "disponibilidades" },
      procedencia: { label: "Procedencia", type: "string" },
      estados: { label: "Estados", type: "string", compoundFields: [
        { name: "etiqueta", label: "Etiqueta", list: "estados" },
        { name: "contenido", label: "Contenido" },
      ] },
      recurso: { label: "Recurso", type: "string", isRef: true, refEntity: "Recurso", refDisplayLabel: "Recurso" },
      fondo: { label: "Fondo", type: "string", isRef: true, refEntity: "Fondo", refDisplayLabel: "Fondo" },
      coleccion: { label: "Colección", type: "string", isRef: true, refEntity: "Coleccion", refDisplayLabel: "Colección" },
    },
    refs: [
      { field: "recurso", refEntity: "Recurso", searchField: "titulo", displayLabel: "Recurso", single: true },
      { field: "fondo", refEntity: "Fondo", searchField: "nombre", displayLabel: "Fondo", single: true },
      { field: "coleccion", refEntity: "Coleccion", searchField: "nombre", displayLabel: "Colección", single: true },
    ],
  },
  Diccionario: {
    label: "Diccionario",
    order: 1,
    fields: {
      tabla: { label: "Tabla", type: "string", main: true },
      campo: { label: "Campo", type: "string", main: true },
      campoLargo: { label: "Campo (Largo)", type: "text" },
      definicion: { label: "Definición", type: "text" },
    },
    refs: [],
  },
};

const REF_CONFIG = {
  Recurso: {
    obrasRelacionadas: { refEntity: "Obra", searchField: "titulo", displayLabel: "Obra", write: "objectArray" },
    contenedores: { refEntity: "Recurso", searchField: "titulo", displayLabel: "Recurso contenedor", write: "objectArray" },
    idiomas: { refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", write: "directArray" },
    materia: { refEntity: "Materia", searchField: "nombre", displayLabel: "Materia", write: "objectArray" },
    proyectos: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray" },
  },
  Obra: {
    idiomas: { refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", write: "directArray" },
    actores: { refEntity: "Actor", searchField: "nombres", displayLabel: "Actor", write: "objectArray", subFields: [
      { name: "nombres", label: "Nombre(s)" },
      { name: "apellidos", label: "Apellidos" },
      { name: "nombreReunion", label: "Nombre de reunión" },
      { name: "nombreArtistico", label: "Nombre artístico" },
      { name: "rol", label: "Rol", entryField: true },
    ] },
    materias: { refEntity: "Materia", searchField: "nombre", displayLabel: "Materia", write: "objectArray" },
    generosFormas: { refEntity: "Genero", searchField: "nombre", displayLabel: "Género", write: "objectArray" },
    GenerosFormasNoMusicales: { refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical", write: "objectArray" },
    mediosSonoros: { refEntity: "Medio", searchField: "nombre", displayLabel: "Medio Sonoro", write: "objectArray" },
    sistemasSonoros: { refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema Sonoro", write: "objectArray", companionFields: [
      { name: "centro", label: "Centro", list: "centros" },
    ] },
    proyectos: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray" },
    contenedores: { refEntity: "Obra", searchField: "titulo", displayLabel: "Obra contenedora", write: "objectArray" },
  },
  Actor: {
    contenedor: { refEntity: "Actor", searchField: "nombres", displayLabel: "Actor contenedor", write: "objectArray" },
  },
  Ejemplar: {
    recurso: { refEntity: "Recurso", searchField: "titulo", displayLabel: "Recurso", write: "direct", single: true },
    fondo: { refEntity: "Fondo", searchField: "nombre", displayLabel: "Fondo", write: "direct", single: true },
    coleccion: { refEntity: "Coleccion", searchField: "nombre", displayLabel: "Colección", write: "direct", single: true },
  },
  Proyecto: {
    investigadores: { refEntity: "Actor", searchField: "nombres", displayLabel: "Actor", write: "objectArray", subFields: [
      { name: "nombres", label: "Nombre(s)" },
      { name: "apellidos", label: "Apellidos" },
      { name: "nombreReunion", label: "Nombre de reunión" },
      { name: "nombreArtistico", label: "Nombre artístico" },
      { name: "rol", label: "Rol", entryField: true },
      { name: "activoDesde", label: "Activo desde", entryField: true },
      { name: "activoHasta", label: "Activo hasta", entryField: true },
      { name: "precisionActivoDesde", label: "Precisión activo desde", entryField: true },
      { name: "precisionActivoHasta", label: "Precisión activo hasta", entryField: true },
    ] },
  },
  Genero: {
    GeneroRelacionado: { refEntity: "Genero", searchField: "nombre", displayLabel: "Género relacionado", write: "objectArray" },
    padres: { refEntity: "Genero", searchField: "nombre", displayLabel: "Género padre", write: "objectArray" },
    hijos: { refEntity: "Genero", searchField: "nombre", displayLabel: "Género hijo", write: "objectArray" },
    idioma: { refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", write: "directArray" },
    sistemasSonoros: { refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema Sonoro", write: "objectArray" },
    mediosSonoros: { refEntity: "Medio", searchField: "nombre", displayLabel: "Medio Sonoro", write: "objectArray" },
    proyectosAsociados: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray", entryKey: "proyecto" },
  },
  GeneroNoMusical: {
    generosRelacionados: { refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical relacionado", write: "objectArray" },
    padres: { refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical padre", write: "objectArray" },
    hijos: { refEntity: "GeneroNoMusical", searchField: "nombre", displayLabel: "Género no musical hijo", write: "objectArray" },
    idioma: { refEntity: "Idioma", searchField: "idioma", displayLabel: "Idioma", write: "directArray" },
  },
  Materia: {
    materiasRelacionadas: { refEntity: "Materia", searchField: "nombre", displayLabel: "Materia relacionada", write: "objectArray" },
    padres: { refEntity: "Materia", searchField: "nombre", displayLabel: "Materia padre", write: "objectArray" },
    hijos: { refEntity: "Materia", searchField: "nombre", displayLabel: "Materia hijo", write: "objectArray" },
  },
  Sistema: {
    sistemasRelacionados: { refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema relacionado", write: "objectArray", companionFields: [
      { name: "centro", label: "Centro", list: "centros" },
    ] },
    padres: { refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema padre", write: "objectArray", companionFields: [
      { name: "centro", label: "Centro", list: "centros" },
    ] },
    hijos: { refEntity: "Sistema", searchField: "nombre", displayLabel: "Sistema hijo", write: "objectArray", companionFields: [
      { name: "centro", label: "Centro", list: "centros" },
    ] },
    proyectosAsociados: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray", entryKey: "proyecto" },
  },
  Medio: {
    proyectosAsociados: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray", entryKey: "proyecto" },
    instrumentos: { refEntity: "Instrumento", searchField: "nombre", displayLabel: "Instrumento", write: "objectArray", entryKey: "instrumento", companionFields: [
      { name: "cantidad", label: "Cantidad", type: "number" },
      { name: "rol", label: "Rol", list: "rolesMedios" },
    ] },
  },
  Instrumento: {
    proyectosAsociados: { refEntity: "Proyecto", searchField: "nombre", displayLabel: "Proyecto", write: "objectArray", entryKey: "proyecto" },
  },
};

const ARRAY_FIELD_BUILDERS = {
  "Obra.denominacionRegional": (val) => ({ denominacionRegional: val, fuenteDenominacion: "" }),
  "Obra.vinculosRelacionados": (val) => ({ etiqueta: val, url: "" }),
  "Obra.descriptores": (val) => ({ etiqueta: "importado", contenido: val }),
  "Actor.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Actor.descriptores": (val) => ({ etiqueta: "importado", contenido: val }),
  "Recurso.numeroNormalizado": (val) => ({ nombre: val, numero: "" }),
  "Recurso.tiposDeRecurso": (val) => ({ id: val }),
  "Recurso.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Recurso.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Instrumento.alias": (val) => ({ nombre: val }),
  "Instrumento.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Instrumento.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Sistema.alias": (val) => ({ nombre: val }),
  "Sistema.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Sistema.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Medio.alias": (val) => ({ nombre: val }),
  "Medio.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Medio.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Genero.alias": (val) => ({ nombre: val }),
  "Genero.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Genero.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "GeneroNoMusical.alias": (val) => ({ nombre: val }),
  "GeneroNoMusical.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "GeneroNoMusical.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Materia.alias": (val) => ({ nombre: val }),
  "Materia.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Materia.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Proyecto.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Proyecto.descriptoresLibres": (val) => ({ etiqueta: "importado", contenido: val }),
  "Idioma.vinculoRelacionado": (val) => ({ etiqueta: val, url: "" }),
  "Idioma.descriptorLibre": (val) => ({ etiqueta: "importado", contenido: val }),
  "Ejemplar.estados": (val) => ({ etiqueta: "importado", contenido: val }),
  "Obra.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Actor.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Recurso.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Instrumento.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Sistema.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Medio.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Genero.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "GeneroNoMusical.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
  "Idioma.anotacionCartograficoTemporal": (val) => ({ lugar: val }),
};

function getDisplayField(entityName) {
  const schema = ENTITY_SCHEMA[entityName];
  if (!schema) return "_id";
  const main = Object.entries(schema.fields).find(([, f]) => f.main);
  return main ? main[0] : "_id";
}

function auditEntityName(entityName) {
  return entityName === "GeneroNoMusical" ? "genero_nomusical" : entityName.toLowerCase();
}

function parseLatLng(value) {
  const parts = String(value).split(/[,;\s]+/).map((n) => Number(n)).filter((n) => !isNaN(n));
  if (parts.length !== 2) return null;
  const [lat, lng] = parts;
  return [lng, lat];
}

async function resolveRefIdByName(refEntity, value) {
  const Model = mongoose.models[refEntity];
  if (!Model || value == null || String(value).trim() === "") return null;
  const text = String(value).trim();
  const exact = new RegExp("^" + escapeRegex(text) + "$", "i");
  let query;
  if (refEntity === "Actor") {
    const parts = text.split(/\s+/);
    query = { nombres: exact };
    if (parts.length > 1) query.apellidos = new RegExp("^" + escapeRegex(parts.slice(1).join(" ")) + "$", "i");
  } else {
    query = { [getDisplayField(refEntity)]: exact };
  }
  const matches = await Model.find(query).limit(2).lean().exec();
  return matches.length === 1 ? matches[0]._id : null;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(columnName, targetEntity) {
  const norm = normalize(columnName);
  const results = [];
  const entities = targetEntity
    ? { [targetEntity]: ENTITY_SCHEMA[targetEntity] }
    : ENTITY_SCHEMA;
  for (const [entityName, entity] of Object.entries(entities)) {
    for (const [fieldName, field] of Object.entries(entity.fields)) {
      if (field.compoundFields) continue;
      if (REF_CONFIG[entityName]?.[fieldName]?.subFields) continue;
      const fieldNorm = normalize(field.label);
      const keyNorm = normalize(fieldName);
      let score = 0;
      if (norm === fieldNorm || norm === keyNorm) score = 1;
      else if (norm.includes(fieldNorm) || fieldNorm.includes(norm)) score = 0.85;
      else {
        const normWords = norm.split(" ");
        const fieldWords = fieldNorm.split(" ");
        const overlap = normWords.filter((w) => fieldWords.includes(w)).length;
        if (overlap > 0) score = Math.min(0.5 + overlap * 0.15, 0.8);
      }
      if (score > 0) {
        results.push({ entity: entityName, field: fieldName, confidence: Math.round(score * 100) });
      }
    }
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 3);
}

function getMainFields(entityName) {
  const entity = ENTITY_SCHEMA[entityName];
  if (!entity) return [];
  return Object.entries(entity.fields)
    .filter(([, f]) => f.main)
    .map(([k]) => k);
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ACCENT_CLASSES = {
  a: "[aáàäâãå]",
  e: "[eéèëê]",
  i: "[iíìïî]",
  o: "[oóòöôõ]",
  u: "[uúùüû]",
  n: "[nñ]",
  c: "[cç]",
  y: "[yý]",
};

function accentTolerantRegex(str) {
  return String(str || "")
    .split("")
    .map((ch) => ACCENT_CLASSES[ch.toLowerCase()] || escapeRegex(ch))
    .join("");
}

function accentFold(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// For an actor, build OR conditions that match the full name in any of these
// representations: all the text in "nombres" OR in "apellidos", or split at
// every position so "Germán Darío" + "Pérez Salazar" in separate columns is
// found even if it was stored in separate fields.
function actorSearchConditions(searchText) {
  const words = String(searchText || "").trim().split(/\s+/).filter(Boolean);
  const or = [];
  if (words.length === 0) return or;
  const full = accentTolerantRegex(words.join(" "));
  or.push({ nombres: new RegExp(full, "i") });
  or.push({ apellidos: new RegExp(full, "i") });
  for (let i = 1; i < words.length; i++) {
    const firstName = accentTolerantRegex(words.slice(0, i).join(" "));
    const lastName = accentTolerantRegex(words.slice(i).join(" "));
    or.push({
      nombres: new RegExp(firstName, "i"),
      apellidos: new RegExp(lastName, "i"),
    });
  }
  return or;
}

function buildRefValue(fieldName, objectIds, refConfig, extraProps) {
  const cfg = refConfig || {};
  if (cfg.single) return objectIds[0] || null;
  if (cfg.write === "directArray") return objectIds;
  if (cfg.write === "objectArray") {
    const key = cfg.entryKey || "id";
    return objectIds.map((id) => extraProps ? { [key]: id, ...extraProps } : { [key]: id });
  }
  return objectIds;
}

async function resolveRefsForRow(entityName, row, activeMappings, refs, req) {
  const resolvedRefs = {};
  const createdRefs = [];

  for (const m of activeMappings) {
    if (m.ignore || !m.field || !m.entity) continue;
    const refConfig = REF_CONFIG[entityName]?.[m.field];
    if (!refConfig) continue;

    const val = row[m.columnIndex];
    if (val == null || String(val).trim() === "") continue;
    const searchText = String(val).trim();

    if (m.refAction === "create") {
      const RefModel = mongoose.model(refConfig.refEntity);
      const displayField = getDisplayField(refConfig.refEntity);
      const newRef = new RefModel({ [displayField]: searchText, creador: req.user?._id });
      const saved = await newRef.save();
      const ids = [saved._id];
      resolvedRefs[m.field] = buildRefValue(m.field, ids, refConfig);
      createdRefs.push({ entity: refConfig.refEntity, id: saved._id, title: searchText });
      await logAudit(req, `${auditEntityName(refConfig.refEntity)}_created`, auditEntityName(refConfig.refEntity), saved._id, searchText);
    } else {
      resolvedRefs[m.field] = buildRefValue(m.field, [new mongoose.Types.ObjectId(m.refMatchId)], refConfig);
    }
  }

  return { resolvedRefs, createdRefs };
}

async function searchExistingRefs(entityName, fieldName, searchText) {
  const refConfig = REF_CONFIG[entityName]?.[fieldName];
  if (!refConfig) return [];
  if (!mongoose.models[refConfig.refEntity]) return [];

  const Model = mongoose.model(refConfig.refEntity);
  let matches;
  if (refConfig.refEntity === "Actor") {
    const or = actorSearchConditions(searchText);
    if (or.length === 0) return [];
    matches = await Model.find({ $or: or }).limit(8).lean().exec();
  } else {
    const regex = new RegExp(escapeRegex(searchText), "i");
    matches = await Model.find({ [refConfig.searchField]: regex })
      .limit(5)
      .lean()
      .exec();
  }

  const displayField = getDisplayField(refConfig.refEntity);
  return matches.map((m) => ({
    _id: m._id.toString(),
    displayField: displayField,
    displayValue: refConfig.refEntity === "Actor"
      ? ([m.nombres, m.apellidos].filter(Boolean).join(" ") || m.nombreArtistico || m.nombreReunion || String(m._id || ""))
      : String(m[displayField] || ""),
  }));
}

async function searchExistingRefsCompound(entityName, fieldName, row, subMappings) {
  const refConfig = REF_CONFIG[entityName]?.[fieldName];
  if (!refConfig) return [];
  if (!mongoose.models[refConfig.refEntity]) return [];

  const Model = mongoose.model(refConfig.refEntity);
  const queryParts = [];
  const displayParts = [];
  const entryMeta = (refConfig.subFields || []).reduce((acc, sf) => (acc[sf.name] = sf, acc), {});

  for (const sm of subMappings) {
    if (entryMeta[sm.subField]?.entryField) continue;
    const val = row[sm.columnIndex];
    if (val == null || String(val).trim() === "") continue;
    const trimmed = String(val).trim();
    // A single column mapped to several subfields (e.g. nombres + apellidos)
    // must not duplicate the combined search text.
    if (!displayParts.some((p) => accentFold(p) === accentFold(trimmed))) {
      displayParts.push(trimmed);
    }
      const fieldMap = {
        nombres: "nombres",
        apellidos: "apellidos",
        nombreReunion: "nombreReunion",
        nombreArtistico: "nombreArtistico",
        rol: "rol",
      };
    const targetField = fieldMap[sm.subField] || sm.subField;
    queryParts.push({ [targetField]: new RegExp(accentTolerantRegex(trimmed), "i") });
  }

  if (queryParts.length === 0) return [];

  // Actor compound names: match the full name (nombres + apellidos) so both
  // properly split records and records stored as a single concatenated field
  // (result of earlier concatenation processes) are found and shown as one name.
  let query = queryParts.length === 1 ? queryParts[0] : { $and: queryParts };
  if (refConfig.refEntity === "Actor") {
    const or = [query];
    const joined = displayParts.join(" ");
    if (joined.trim()) {
      or.push(
        { nombres: new RegExp(accentTolerantRegex(joined), "i") },
        { apellidos: new RegExp(accentTolerantRegex(joined), "i") }
      );
    }
    for (const part of displayParts) {
      const rx = new RegExp(accentTolerantRegex(part), "i");
      or.push({ nombres: rx }, { apellidos: rx });
    }
    query = { $or: or };
  }

  const matches = await Model.find(query).limit(8).lean().exec();

  const displayField = getDisplayField(refConfig.refEntity);
  const seen = new Set();
  const uniqueMatches = [];
  for (const m of matches) {
    const disp = refConfig.refEntity === "Actor"
      ? ([m.nombres, m.apellidos].filter(Boolean).join(" ") || m.nombreArtistico || m.nombreReunion || String(m._id || ""))
      : String(m[displayField] || "");
    const key = m._id.toString() + "|" + disp.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueMatches.push({ m, disp });
  }

  return {
    combinedSearchText: displayParts.join(" "),
    matches: uniqueMatches.map(({ m, disp }) => ({
      _id: m._id.toString(),
      displayField: displayField,
      displayValue: disp,
    })),
  };
}

exports.preview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se ha proporcionado ningún archivo" });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return res.status(400).json({ message: "El archivo Excel no contiene hojas" });
    const jsonData = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const vals = row.values.slice(1).map((v) => (v == null ? "" : String(v)));
      jsonData.push(vals);
    });
    if (jsonData.length < 2) return res.status(400).json({ message: "El archivo debe contener al menos un encabezado y una fila de datos" });
    const columns = jsonData[0].map((c) => String(c).trim());
    const rows = jsonData.slice(1).filter((r) => r.some((cell) => String(cell).trim() !== ""));
    const previewRows = rows.slice(0, 5);

    const columnExamples = columns.map((_, ci) => {
      const vals = rows.map((r) => r[ci]).filter((v) => v != null && String(v).trim() !== "");
      const shuffled = vals.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 5);
    });

    const entities = Object.entries(ENTITY_SCHEMA).map(([key, e]) => ({
      name: key,
      label: e.label,
      order: e.order ?? 99,
      fields: Object.entries(e.fields).map(([fk, fv]) => ({
        name: fk,
        label: fv.label,
        type: fv.type,
        main: !!fv.main,
        list: fv.list || null,
        isRef: !!REF_CONFIG[key]?.[fk],
        isCompoundObject: !!fv.compoundFields,
        refEntity: REF_CONFIG[key]?.[fk]?.refEntity || null,
        refDisplayLabel: REF_CONFIG[key]?.[fk]?.displayLabel || null,
        subFields: fv.compoundFields || REF_CONFIG[key]?.[fk]?.subFields || null,
        companionFields: REF_CONFIG[key]?.[fk]?.companionFields || null,
      })),
      refs: Object.entries(REF_CONFIG[key] || {}).map(([fk, fv]) => ({
        field: fk,
        refEntity: fv.refEntity,
        searchField: fv.searchField,
        displayLabel: fv.displayLabel,
        single: !!fv.single,
      })),
    }));

    const autoMap = columns.map((col, i) => {
      const suggestions = fuzzyMatch(col);
      return {
        columnIndex: i,
        columnName: col,
        suggestions,
        bestMatch: suggestions.length > 0 && suggestions[0].confidence >= 60 ? suggestions[0] : null,
      };
    });

    res.json({
      success: true,
      data: {
        columns,
        totalRows: rows.length,
        previewRows,
        rows,
        autoMap,
        sheetName: worksheet.name,
        entities,
        columnExamples,
      },
    });
  } catch (err) {
    console.error("[import preview error]", err);
    res.status(400).json({ message: err.message || "Error al procesar el archivo" });
  }
};

exports.searchRef = async (req, res) => {
  try {
    const { entityName, searchText, excludedIds } = req.body;
    if (!entityName || !searchText) {
      return res.status(400).json({ message: "Faltan entityName o searchText" });
    }
    if (!mongoose.models[entityName]) {
      return res.status(400).json({ message: `Modelo no encontrado: ${entityName}` });
    }
    const Model = mongoose.model(entityName);
    const displayField = getDisplayField(entityName);
    let query;
    if (entityName === "Actor") {
      const or = actorSearchConditions(searchText);
      if (or.length === 0) {
        return res.json({ success: true, data: [] });
      }
      query = { $or: or };
    } else {
      const regex = new RegExp(escapeRegex(searchText), "i");
      query = { [displayField]: regex };
    }
    if (excludedIds?.length) {
      query._id = { $nin: excludedIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }
    const matches = await Model.find(query).limit(10).lean().exec();
    const results = matches.map((m) => ({
      _id: m._id.toString(),
      displayValue: entityName === "Actor"
        ? [m.nombres, m.apellidos].filter(Boolean).join(" ")
        : String(m[displayField] || ""),
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("[import searchRef error]", err);
    res.status(400).json({ message: err.message || "Error al buscar referencias" });
  }
};

exports.searchAllRefs = async (req, res) => {
  try {
    const { entityName, rows, mappings, compoundRefGroups, compoundObjectGroups } = req.body;
    if (!entityName || !rows || !mappings) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }
    const refConfigs = REF_CONFIG[entityName];
    if (!refConfigs) {
      return res.json({ success: true, data: [] });
    }
    const refResults = [];

    // 1. Process individual column mappings (existing behavior)
    const refMappings = mappings.filter((m) => !m.ignore && m.entity === entityName && m.field && refConfigs[m.field] && !m.subField);
    for (const m of refMappings) {
      const refCfg = refConfigs[m.field];
      if (!refCfg) continue;
      const valuesMap = new Map();
      for (let ri = 0; ri < rows.length; ri++) {
        const val = rows[ri]?.[m.columnIndex];
        if (val == null || String(val).trim() === "") continue;
        const searchText = String(val).trim();
        if (!valuesMap.has(searchText)) {
          const matches = await searchExistingRefs(entityName, m.field, searchText);
          const exactMatch = matches.some(
            (match) => accentFold(match.displayValue) === accentFold(searchText)
          );
          valuesMap.set(searchText, {
            searchText,
            matches,
            exactMatch,
            rowIndices: [ri],
            defaultAction: exactMatch ? "use_existing" : "create",
            defaultMatchId: exactMatch && matches.length > 0 ? matches[0]._id : null,
          });
        } else {
          valuesMap.get(searchText).rowIndices.push(ri);
        }
      }
      refResults.push({
        columnIndex: m.columnIndex,
        columnName: m.columnName,
        field: m.field,
        refEntity: refCfg.refEntity,
        displayLabel: refCfg.displayLabel,
        single: !!refCfg.single,
        uniqueValues: Array.from(valuesMap.values()),
      });
    }

    // 2. Process compound ref groups
    if (compoundRefGroups && compoundRefGroups.length > 0) {
      for (const grp of compoundRefGroups) {
        const refCfg = refConfigs[grp.refField];
        if (!refCfg || !grp.subMappings || grp.subMappings.length === 0) continue;
        const valuesMap = new Map();
        for (let ri = 0; ri < rows.length; ri++) {
          const row = rows[ri];
          const result = await searchExistingRefsCompound(entityName, grp.refField, row, grp.subMappings);
          if (!result || !result.combinedSearchText) continue;
          const combinedText = result.combinedSearchText;
          if (!valuesMap.has(combinedText)) {
            const exactMatch = result.matches.some(
              (match) => accentFold(match.displayValue) === accentFold(combinedText)
            );
            valuesMap.set(combinedText, {
              searchText: combinedText,
              matches: result.matches,
              exactMatch,
              rowIndices: [ri],
              defaultAction: exactMatch ? "use_existing" : "create",
              defaultMatchId: exactMatch && result.matches.length > 0 ? result.matches[0]._id : null,
            });
          } else {
            valuesMap.get(combinedText).rowIndices.push(ri);
          }
        }
        refResults.push({
          columnIndex: -1,
          columnName: grp.refField + " (compuesto)",
          field: grp.refField,
          refEntity: refCfg.refEntity,
          displayLabel: refCfg.displayLabel + " (compuesto)",
          single: !!refCfg.single,
          isCompound: true,
          compoundGroupId: grp.id,
          uniqueValues: Array.from(valuesMap.values()),
        });
      }
    }

    res.json({ success: true, data: refResults });
  } catch (err) {
    console.error("[import searchAllRefs error]", err);
    res.status(400).json({ message: err.message || "Error al buscar referencias" });
  }
};

exports.execute = async (req, res) => {
  try {
    let { columns, rows, entities } = req.body;

    // Backward compatibility: single-entity payload
    if (!entities) {
      entities = [{
        entityName: req.body.entityName,
        mappings: req.body.mappings,
        actions: req.body.actions,
        refResolutions: req.body.refResolutions || {},
      }];
    }

    if (!columns || !rows || !entities || entities.length === 0) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }
    for (const e of entities) {
      if (!mongoose.models[e.entityName]) {
        return res.status(400).json({ message: `Modelo no encontrado: ${e.entityName}` });
      }
    }

    // Track created/matched IDs per entity per row: Map<entityName, Map<rowIndex, docId>>
    const createdIds = new Map();

    const allEntityResults = [];
    let totalCreated = 0, totalErrors = 0, totalSkipped = 0, totalWarnings = 0;

    for (const entityConfig of entities) {
      const { entityName, mappings, actions, refResolutions, autoLinks, compoundRefGroups, compoundObjectGroups, fixedDescriptors } = entityConfig;
      const Model = mongoose.model(entityName);
      const results = [];
      let created = 0, errors = 0, skipped = 0, warnings = 0;
      // Refs creados por nombre dentro de esta importación: evita duplicados cuando varias filas
      // comparten el mismo valor y se resolvió "crear" (cache: refEntity|field|valor normalizado)
      const createdRefCache = new Map();

      if (!createdIds.has(entityName)) {
        createdIds.set(entityName, new Map());
      }

      for (const action of actions || []) {
        const { rowIndex, rowAction } = action;
        const row = rows[rowIndex];
        if (!row) {
          results.push({ rowIndex, status: "error", message: `[${entityName}] Fila no encontrada` });
          errors++;
          continue;
        }
        if (rowAction === "skip") {
          results.push({ rowIndex, status: "skipped", message: `[${entityName}] Omitida por el usuario` });
          skipped++;
          continue;
        }
        const activeMappings = mappings.filter((m) => !m.ignore && m.entity === entityName && m.field);
        if (activeMappings.length === 0) {
          results.push({ rowIndex, status: "error", message: `[${entityName}] No hay mapeos activos` });
          errors++;
          continue;
        }
        try {
          const rowRefResolutions = refResolutions?.[rowIndex] || {};
          const docData = { creador: req.user?._id };
          const descriptorData = [];

          // Constant values (non-ref fields): the constant wins over mapped columns
          const fieldConstants = {};
          for (const mm of activeMappings) {
            if (mm.constantValue != null && String(mm.constantValue).trim() !== "" && !REF_CONFIG[entityName]?.[mm.field]) {
              fieldConstants[mm.field] = String(mm.constantValue).trim();
            }
          }

          for (const m of activeMappings) {
            const rawVal = m.constantValue ?? row[m.columnIndex];
            if (rawVal == null || String(rawVal).trim() === "") continue;

            // Split by delimiter if configured
            const values = m.delimiter
              ? String(rawVal).trim().split(m.delimiter).map((s) => s.trim()).filter(Boolean)
              : [String(rawVal).trim()];

            const refConfig = REF_CONFIG[entityName]?.[m.field];
            const extraProps = {};
            if (refConfig?.companionFields) {
              for (const cf of refConfig.companionFields) {
                const cv = (m.companionValues || []).find((c) => c.name === cf.name);
                if (!cv) continue;
                const cval = cv.constantValue ?? row[cv.columnIndex];
                if (cval == null || String(cval).trim() === "") continue;
                extraProps[cf.name] = cf.type === "number" ? Number(cval) : String(cval).trim();
              }
            }

            if (refConfig) {
              const reso = rowRefResolutions[m.field];
              for (const part of values) {
                if (reso?.action === "create") {
                  const RefModel = mongoose.model(refConfig.refEntity);
                  const displayField = getDisplayField(refConfig.refEntity);
                  const cacheKey = `${refConfig.refEntity}|${m.field}|${part.toLowerCase()}`;
                  let refId = createdRefCache.get(cacheKey);
                  let createdNow = false;
                  if (!refId) {
                    try {
                      const newRef = new RefModel({ [displayField]: part, creador: req.user?._id });
                      const saved = await newRef.save();
                      refId = saved._id;
                      createdNow = true;
                    } catch (err) {
                      if (err?.code === 11000) {
                        const dup = await RefModel.findOne({ [displayField]: part }).lean().exec();
                        if (dup) {
                          refId = dup._id;
                          results.push({ rowIndex, status: "warning", message: `[${entityName}] Ya existía ${auditEntityName(refConfig.refEntity)} "${part}" — se reutilizó el existente` });
                          warnings++;
                        }
                      }
                      if (!refId) throw err;
                    }
                    createdRefCache.set(cacheKey, refId);
                  }
                  const ids = [refId];
                  if (!docData[m.field]) docData[m.field] = [];
                  const built = buildRefValue(m.field, ids, refConfig, Object.keys(extraProps).length ? extraProps : undefined);
                  docData[m.field] = docData[m.field].concat(Array.isArray(built) ? built : [built]);
                  if (createdNow) await logAudit(req, `${auditEntityName(refConfig.refEntity)}_created`, auditEntityName(refConfig.refEntity), refId, part);
                } else if (reso?.action === "use_existing" && reso.matchId) {
                  const ids = [new mongoose.Types.ObjectId(reso.matchId)];
                  if (!docData[m.field]) docData[m.field] = [];
                  const built = buildRefValue(m.field, ids, refConfig, Object.keys(extraProps).length ? extraProps : undefined);
                  docData[m.field] = docData[m.field].concat(Array.isArray(built) ? built : [built]);
                }
              }
            } else {
              const builderKey = `${entityName}.${m.field}`;
              if (ARRAY_FIELD_BUILDERS[builderKey]) {
                if (!docData[m.field]) docData[m.field] = [];
                for (const part of values) {
                  docData[m.field].push(ARRAY_FIELD_BUILDERS[builderKey](part));
                }
              } else if (fieldConstants[m.field] != null) {
                if (!docData[m.field]) docData[m.field] = fieldConstants[m.field];
              } else {
                const trimmedVal = String(rawVal).trim();
                docData[m.field] = docData[m.field] != null ? docData[m.field] + " " + trimmedVal : trimmedVal;
              }
            }
          }

          // Process compound object groups (e.g. anotacionCartograficoTemporal with lugar, evento, etc.)
          if (compoundObjectGroups && compoundObjectGroups.length > 0) {
            for (const grp of compoundObjectGroups) {
              if (!grp.subMappings || grp.subMappings.length === 0) continue;
              const compoundFieldMeta = (ENTITY_SCHEMA[entityName]?.fields?.[grp.field]?.compoundFields || [])
                .reduce((acc, sf) => (acc[sf.name] = sf, acc), {});
              const entry = {};
              // El bloque solo se incluye si al menos un valor viene de la fila del archivo:
              // un texto fijo por sí solo no debe crear datos que no existen para esa fila.
              let hasRowData = false;
              for (const sm of grp.subMappings) {
                const fromRow = sm.constantValue == null || String(sm.constantValue).trim() === "";
                const val = sm.constantValue ?? row[sm.columnIndex];
                if (val == null || String(val).trim() === "") continue;
                if (fromRow) hasRowData = true;
                if (sm.subField === "coordenadas") {
                  const coords = parseLatLng(val);
                  if (coords) entry.coordenadas = coords;
                  continue;
                }
                const meta = compoundFieldMeta[sm.subField];
                if (meta?.refEntity) {
                  const refId = await resolveRefIdByName(meta.refEntity, val);
                  if (refId) entry[sm.subField] = refId;
                  continue;
                }
                entry[sm.subField] = String(val).trim();
              }
              if (hasRowData && Object.keys(entry).length > 0) {
                if (!docData[grp.field]) docData[grp.field] = [];
                docData[grp.field].push(entry);
              }
            }
          }

          // Process compound ref groups (e.g. Actor with nombres + apellidos sub-fields)
          if (compoundRefGroups && compoundRefGroups.length > 0) {
            for (const grp of compoundRefGroups) {
              if (!grp.subMappings || grp.subMappings.length === 0) continue;
              const refConfig = REF_CONFIG[entityName]?.[grp.refField];
              if (!refConfig) continue;

              // Collect sub-field values from the row
              const subData = {};
              const entryData = {};
              const entryMeta = (refConfig.subFields || []).reduce((acc, sf) => (acc[sf.name] = sf, acc), {});
              // La referencia compuesta solo se procesa si al menos un valor viene de la fila:
              // un texto fijo por sí solo no debe crear un ref para una fila sin ese dato.
              let hasRowData = false;
              for (const sm of grp.subMappings) {
                const fromRow = sm.constantValue == null || String(sm.constantValue).trim() === "";
                const val = sm.constantValue ?? row[sm.columnIndex];
                if (val == null || String(val).trim() === "") continue;
                if (fromRow) hasRowData = true;
                const target = entryMeta[sm.subField]?.entryField ? entryData : subData;
                const fieldMap = {
                  nombres: "nombres",
                  apellidos: "apellidos",
                  nombreReunion: "nombreReunion",
                  nombreArtistico: "nombreArtistico",
                };
                const targetField = fieldMap[sm.subField] || sm.subField;
                const trimmed = String(val).trim();
                target[targetField] = target[targetField] != null ? target[targetField] + " " + trimmed : trimmed;
              }
              if (Object.keys(subData).length === 0 && Object.keys(entryData).length === 0) continue;
              if (!hasRowData) continue;

              const displayValue = Object.values(subData).join(" ");

              // Check ref resolution: use group ID as the unique key in refResolutions
              const reso = rowRefResolutions[`comp_${grp.id}`] || rowRefResolutions[grp.refField];

              if (reso?.action === "create") {
                const RefModel = mongoose.model(refConfig.refEntity);
                const docToCreate = { creador: req.user?._id };
                for (const [field, value] of Object.entries(subData)) {
                  docToCreate[field] = value;
                }
                // Actors: nombre/apellido can be empty if a stage name or reunion name exists
                if (refConfig.refEntity === "Actor") {
                  if (!String(docToCreate.nombres || "").trim()) {
                    docToCreate.nombres = String(docToCreate.nombreReunion || docToCreate.nombreArtistico || "").trim();
                  }
                  if (!String(docToCreate.nombres || "").trim() && String(docToCreate.apellidos || "").trim()) {
                    docToCreate.nombres = String(docToCreate.apellidos).trim();
                  }
                  if (!String(docToCreate.nombres || "").trim() && !String(docToCreate.apellidos || "").trim()) {
                    continue;
                  }
                }
                const cacheKey = `${refConfig.refEntity}|${grp.refField}|${String(displayValue).toLowerCase()}`;
                let refId = createdRefCache.get(cacheKey);
                let createdNow = false;
                if (!refId) {
                  try {
                    const saved = await new RefModel(docToCreate).save();
                    refId = saved._id;
                    createdNow = true;
                  } catch (err) {
                    if (err?.code === 11000) {
                      const dup = await RefModel.findOne({ [getDisplayField(refConfig.refEntity)]: displayValue }).lean().exec();
                      if (dup) {
                        refId = dup._id;
                        results.push({ rowIndex, status: "warning", message: `[${entityName}] Ya existía ${auditEntityName(refConfig.refEntity)} "${displayValue}" — se reutilizó el existente` });
                        warnings++;
                      }
                    }
                    if (!refId) throw err;
                  }
                  createdRefCache.set(cacheKey, refId);
                }
                const ids = [refId];
                const extraProps = { ...entryData };
                if (grp.refRol) extraProps.rol = grp.refRol;
                if (!docData[grp.refField]) docData[grp.refField] = [];
                const built = buildRefValue(grp.refField, ids, refConfig, Object.keys(extraProps).length ? extraProps : undefined);
                docData[grp.refField] = docData[grp.refField].concat(Array.isArray(built) ? built : [built]);
                if (createdNow) await logAudit(req, `${auditEntityName(refConfig.refEntity)}_created`, auditEntityName(refConfig.refEntity), refId, displayValue);
              } else if (reso?.action === "use_existing" && reso.matchId) {
                const ids = [new mongoose.Types.ObjectId(reso.matchId)];
                const extraProps = { ...entryData };
                if (grp.refRol) extraProps.rol = grp.refRol;
                if (!docData[grp.refField]) docData[grp.refField] = [];
                const built = buildRefValue(grp.refField, ids, refConfig, Object.keys(extraProps).length ? extraProps : undefined);
                docData[grp.refField] = docData[grp.refField].concat(Array.isArray(built) ? built : [built]);
              }
            }
          }

          // Apply autoLinks: forward links (field on current entity → parent)
          if (autoLinks) {
            for (const link of autoLinks) {
              if (link.reverse) continue;
              const parentRowIds = createdIds.get(link.parentEntity);
              const parentId = parentRowIds?.get(rowIndex);
              if (parentId) {
                const refConfig = REF_CONFIG[entityName]?.[link.field];
                if (refConfig) {
                  const ids = [new mongoose.Types.ObjectId(parentId)];
                  const built = buildRefValue(link.field, ids, refConfig);
                  if (!docData[link.field]) docData[link.field] = [];
                  docData[link.field] = docData[link.field].concat(Array.isArray(built) ? built : [built]);
                }
              }
            }
          }

          for (const m of activeMappings) {
            const val = row[m.columnIndex];
            if (val == null || String(val).trim() === "") continue;
            const refConfig = REF_CONFIG[entityName]?.[m.field];
            if (!refConfig) {
              if (m.asDescriptor && !m.ignore) {
                descriptorData.push({ etiqueta: m.descriptorKey || m.columnName, contenido: String(val) });
              }
            }
          }

          // Fixed descriptors (configured in the mapping step, not tied to any column)
          for (const fd of fixedDescriptors || []) {
            if (fd && String(fd.etiqueta || "").trim() !== "" && String(fd.contenido || "").trim() !== "") {
              descriptorData.push({ etiqueta: String(fd.etiqueta).trim(), contenido: String(fd.contenido).trim() });
            }
          }

          if (docData.titulo != null && ENTITY_SCHEMA[entityName]?.fields?.nombre != null && !docData.nombre) {
            docData.nombre = docData.titulo;
          }
          if (descriptorData.length > 0) {
            const descriptorPath = entityName === "Actor" || entityName === "Obra" ? "descriptores" : "descriptorLibre";
            docData[descriptorPath] = descriptorData;
          }

          const doc = new Model(docData);
          const saved = await doc.save();
          const title = saved.titulo || saved.nombre || saved.idioma || saved.numeroEjemplar || saved._id;

          // Store the created/matched ID for downstream autoLinks
          createdIds.get(entityName).set(rowIndex, saved._id.toString());

          // Reverse autoLinks: update parent entity to reference this entity
          if (autoLinks) {
            for (const link of autoLinks) {
              if (!link.reverse) continue;
              const thisId = saved._id.toString();
              const parentRowIds = createdIds.get(link.parentEntity);
              const parentId = parentRowIds?.get(rowIndex);
              if (!parentId) continue;
              const parentModel = mongoose.model(link.parentEntity);
              const parentRefConfig = REF_CONFIG[link.parentEntity]?.[link.field];
              if (!parentRefConfig) continue;
              const built = buildRefValue(link.field, [new mongoose.Types.ObjectId(thisId)], parentRefConfig);
              if (parentRefConfig.single) {
                await parentModel.updateOne(
                  { _id: new mongoose.Types.ObjectId(parentId) },
                  { $set: { [link.field]: built } }
                ).exec();
              } else {
                await parentModel.updateOne(
                  { _id: new mongoose.Types.ObjectId(parentId) },
                  { $push: { [link.field]: { $each: Array.isArray(built) ? built : [built] } } }
                ).exec();
              }
            }
          }

          await logAudit(req, `${auditEntityName(entityName)}_created`, auditEntityName(entityName), saved._id, String(title));
          results.push({ rowIndex, status: "success", message: `${ENTITY_SCHEMA[entityName]?.label || entityName} "${title}" creado`, docId: saved._id.toString() });
          created++;
        } catch (err) {
          results.push({ rowIndex, status: "error", message: `[${entityName}] ${err.message || "Error al procesar fila"}` });
          errors++;
        }
      }

      allEntityResults.push({ entityName, results, summary: { created, updated: 0, skipped, errors, warnings, total: results.length } });
      totalCreated += created;
      totalErrors += errors;
      totalSkipped += skipped;
      totalWarnings += warnings;
    }

    const flatResults = allEntityResults.flatMap((er) => er.results);
    res.json({
      success: true,
      data: {
        results: flatResults,
        entityResults: allEntityResults,
        summary: { created: totalCreated, updated: 0, skipped: totalSkipped, errors: totalErrors, warnings: totalWarnings, total: flatResults.length },
      },
    });
    await logAudit(req, "import_executed", "import", null, `Creados: ${totalCreated}, Omitidos: ${totalSkipped}, Errores: ${totalErrors}, Avisos: ${totalWarnings}`);
  } catch (err) {
    console.error("[import execute error]", err);
    res.status(400).json({ message: err.message || "Error al ejecutar la importación" });
  }
};

exports.dedup = async (req, res) => {
  try {
    const { columns, rows, mappings, entityName } = req.body;
    if (!columns || !rows || !mappings || !entityName) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }
    if (!mongoose.models[entityName]) {
      return res.status(400).json({ message: `Modelo no encontrado: ${entityName}` });
    }
    const Model = mongoose.model(entityName);
    const mainFields = getMainFields(entityName);
    const mainMappings = mappings.filter((m) => !m.ignore && m.entity === entityName && mainFields.includes(m.field));

    const validations = [];
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      let matchFound = false, matchId = null, matchTitle = null;
      const queryConditions = [];
      const groupedMainValues = new Map();
      for (const m of mainMappings) {
        const val = m.constantValue ?? row[m.columnIndex];
        if (val != null && String(val).trim()) {
          groupedMainValues.set(m.field, (groupedMainValues.get(m.field) ?? "") + " " + String(val).trim());
        }
      }
      for (const [field, text] of groupedMainValues) {
        queryConditions.push({ [field]: { $regex: new RegExp(`^${escapeRegex(text.trim())}$`, "i") } });
      }
      if (queryConditions.length > 0) {
        const match = await Model.findOne({ $or: queryConditions }).lean().exec();
        if (match) {
          matchFound = true;
          matchId = match._id.toString();
          matchTitle = String(match.titulo || match.nombre || match.idioma || match.numeroEjemplar || match._id);
        }
      }
      validations.push({
        rowIndex: ri,
        data: row,
        matchFound,
        matchId,
        matchTitle,
        matchConfidence: matchFound ? 90 : 0,
        suggestedAction: matchFound ? "update" : "create",
        selected: true,
      });
    }
    res.json({ success: true, data: validations });
  } catch (err) {
    console.error("[import dedup error]", err);
    res.status(400).json({ message: err.message || "Error al validar datos" });
  }
};
