import { Injectable } from '@angular/core';

export interface MarcField {
  tag: string;
  subfield: string;
  label: string;
  value: string;
}

export interface DcField {
  element: string;
  label: string;
  value: string;
}

export interface SimrField {
  field: string;
  value: string;
}

const EXCLUDE = new Set([
  '_id',
  '__v',
  '_entityType',
  '_searchScore',
  '$hashKey',
  '$$hashKey',
  'creado',
  'modificado',
  'creador',
]);

@Injectable({ providedIn: 'root' })
export class MetadataMapperService {
  private readonly marc21Mapping: Record<string, { tag: string; subfield: string; label: string }> = {
    titulo: { tag: '245', subfield: 'a', label: 'Título' },
    subtitulo: { tag: '245', subfield: 'b', label: 'Subtítulo' },
    nombreUniforme: { tag: '240', subfield: 'a', label: 'Título Uniforme' },
    fechaComposicion: { tag: '260', subfield: 'c', label: 'Fecha' },
    genero: { tag: '655', subfield: 'a', label: 'Género' },
    instrumentacion: { tag: '382', subfield: 'a', label: 'Instrumentación' },
    instrumentos: { tag: '382', subfield: 'a', label: 'Instrumentos' },
    duracion: { tag: '306', subfield: 'a', label: 'Duración' },
    tonalidad: { tag: '384', subfield: 'a', label: 'Tonalidad' },
    compas: { tag: '384', subfield: 'b', label: 'Compás' },
    actores: { tag: '700', subfield: 'a', label: 'Actores' },
    obras: { tag: '700', subfield: 't', label: 'Obras' },
    materias: { tag: '650', subfield: 'a', label: 'Materias' },
    idiomas: { tag: '041', subfield: 'a', label: 'Idiomas' },
    nombres: { tag: '100', subfield: 'a', label: 'Nombre' },
    apellidos: { tag: '100', subfield: 'a', label: 'Apellido' },
    nombreReunion: { tag: '110', subfield: 'a', label: 'Nombre Corporativo' },
    fechaNacimiento: { tag: '100', subfield: 'd', label: 'Fecha Nacimiento' },
    fechaMuerte: { tag: '100', subfield: 'd', label: 'Fecha Muerte' },
    lugarNacimiento: { tag: '370', subfield: 'a', label: 'Lugar Nacimiento' },
    tituloRecurso: { tag: '245', subfield: 'a', label: 'Título Recurso' },
    editorial: { tag: '260', subfield: 'b', label: 'Editorial' },
    lugarPublicacion: { tag: '260', subfield: 'a', label: 'Lugar Publicación' },
    fechaPublicacion: { tag: '260', subfield: 'c', label: 'Fecha Publicación' },
    isbn: { tag: '020', subfield: 'a', label: 'ISBN' },
    issn: { tag: '022', subfield: 'a', label: 'ISSN' },
    recurso: { tag: '245', subfield: 'a', label: 'Recurso' },
    notas: { tag: '500', subfield: 'a', label: 'Notas Generales' },
    descripcionFisica: { tag: '300', subfield: 'a', label: 'Descripción Física' },
    idioma: { tag: '041', subfield: 'a', label: 'Idioma' },
    materia: { tag: '650', subfield: 'a', label: 'Materia' },
    nombreColeccion: { tag: '710', subfield: 'a', label: 'Colección' },
    nombreFondo: { tag: '773', subfield: 't', label: 'Fondo' },
    fondo: { tag: '773', subfield: 't', label: 'Fondo' },
    coleccion: { tag: '710', subfield: 'a', label: 'Colección' },
    medio: { tag: '340', subfield: 'a', label: 'Medio' },
    sistema: { tag: '340', subfield: 'b', label: 'Sistema' },
    proyecto: { tag: '710', subfield: 'a', label: 'Proyecto' },
    creado: { tag: '583', subfield: 'c', label: 'Fecha Creación' },
    modificado: { tag: '583', subfield: 'c', label: 'Fecha Modificación' },
  };

  private readonly dublinCoreMapping: Record<
    string,
    { element: string; qualifier?: string; label: string }
  > = {
    titulo: { element: 'dc:title', label: 'Título' },
    subtitulo: { element: 'dc:title', qualifier: 'alternative', label: 'Subtítulo' },
    nombreUniforme: { element: 'dc:title', qualifier: 'alternative', label: 'Título Uniforme' },
    fechaComposicion: { element: 'dc:date', qualifier: 'created', label: 'Fecha Creación' },
    genero: { element: 'dc:type', label: 'Tipo' },
    instrumentacion: { element: 'dc:format', qualifier: 'medium', label: 'Instrumentación' },
    instrumentos: { element: 'dc:format', qualifier: 'medium', label: 'Instrumentos' },
    duracion: { element: 'dc:format', qualifier: 'extent', label: 'Duración' },
    tonalidad: { element: 'dc:subject', label: 'Tonalidad' },
    actores: { element: 'dc:contributor', label: 'Actores' },
    obras: { element: 'dc:relation', label: 'Obras' },
    materias: { element: 'dc:subject', label: 'Materias' },
    idiomas: { element: 'dc:language', label: 'Idiomas' },
    nombres: { element: 'dc:creator', label: 'Creador' },
    apellidos: { element: 'dc:creator', label: 'Creador' },
    nombreReunion: { element: 'dc:creator', label: 'Creador Corporativo' },
    fechaNacimiento: { element: 'dc:coverage', qualifier: 'temporal', label: 'Fecha Nacimiento' },
    lugarNacimiento: { element: 'dc:coverage', qualifier: 'spatial', label: 'Lugar Nacimiento' },
    tituloRecurso: { element: 'dc:title', label: 'Título' },
    editorial: { element: 'dc:publisher', label: 'Editorial' },
    lugarPublicacion: { element: 'dc:coverage', qualifier: 'spatial', label: 'Lugar Publicación' },
    fechaPublicacion: { element: 'dc:date', qualifier: 'issued', label: 'Fecha Publicación' },
    isbn: { element: 'dc:identifier', qualifier: 'isbn', label: 'ISBN' },
    issn: { element: 'dc:identifier', qualifier: 'issn', label: 'ISSN' },
    recurso: { element: 'dc:relation', label: 'Recurso' },
    notas: { element: 'dc:description', label: 'Descripción' },
    descripcionFisica: { element: 'dc:format', label: 'Formato' },
    idioma: { element: 'dc:language', label: 'Idioma' },
    materia: { element: 'dc:subject', label: 'Materia' },
    nombreColeccion: { element: 'dc:relation', qualifier: 'isPartOf', label: 'Parte de' },
    nombreFondo: { element: 'dc:relation', qualifier: 'isPartOf', label: 'Pertenece a' },
    fondo: { element: 'dc:relation', qualifier: 'isPartOf', label: 'Fondo' },
    coleccion: { element: 'dc:relation', qualifier: 'isPartOf', label: 'Colección' },
    medio: { element: 'dc:format', label: 'Medio' },
    sistema: { element: 'dc:format', label: 'Sistema' },
    proyecto: { element: 'dc:relation', label: 'Proyecto' },
    derechos: { element: 'dc:rights', label: 'Derechos' },
    creado: { element: 'dc:date', qualifier: 'created', label: 'Fecha Creación' },
    modificado: { element: 'dc:date', qualifier: 'modified', label: 'Fecha Modificación' },
  };

  private extractValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => this.extractValue(item))
        .filter((v) => v !== '')
        .join('; ');
    }
    if (typeof value === 'object') {
      if (value.nombre) return value.nombre;
      if (value.titulo) return value.titulo;
      if (value.nombres && value.apellidos) return `${value.nombres} ${value.apellidos}`;
      if (value.nombreReunion) return value.nombreReunion;
      if (value.idioma) return value.idioma;
      if (value.numeroEjemplar) return value.numeroEjemplar;
      if (value.actor) return this.extractValue(value.actor);
      if (value.obra) return this.extractValue(value.obra);
      if (value.instrumento) return this.extractValue(value.instrumento);
      if (value.recurso) return this.extractValue(value.recurso);
      if (value._id) return value._id.toString();
      return '';
    }
    return String(value);
  }

  toMARC21(result: Record<string, any>): MarcField[] {
    const mapped: MarcField[] = [];
    for (const key of Object.keys(result)) {
      if (EXCLUDE.has(key) || result[key] === undefined || result[key] === null) {
        continue;
      }
      const value = this.extractValue(result[key]);
      if (value.trim() === '') {
        continue;
      }
      const mapping = this.marc21Mapping[key];
      if (mapping) {
        mapped.push({ ...mapping, value });
      } else if (!/id$/i.test(key)) {
        mapped.push({ tag: '590', subfield: 'a', label: key, value });
      }
    }
    return mapped;
  }

  toDublinCore(result: Record<string, any>): DcField[] {
    const mapped: DcField[] = [];
    for (const key of Object.keys(result)) {
      if (EXCLUDE.has(key) || result[key] === undefined || result[key] === null) {
        continue;
      }
      const value = this.extractValue(result[key]);
      if (value.trim() === '') {
        continue;
      }
      const mapping = this.dublinCoreMapping[key];
      if (mapping) {
        const element = mapping.qualifier ? `${mapping.element}:${mapping.qualifier}` : mapping.element;
        mapped.push({ element, label: mapping.label, value });
      } else if (!/id$/i.test(key)) {
        mapped.push({ element: 'dc:description', label: key, value });
      }
    }
    return mapped;
  }

  toSIMR(result: Record<string, any>): SimrField[] {
    const mapped: SimrField[] = [];
    for (const key of Object.keys(result)) {
      if (EXCLUDE.has(key) || result[key] === undefined || result[key] === null || /id$/i.test(key)) {
        continue;
      }
      const value = this.extractValue(result[key]);
      if (value.trim() !== '') {
        mapped.push({ field: key, value });
      }
    }
    return mapped;
  }

  getAvailableFormats(): { value: string; label: string }[] {
    return [
      { value: 'simr', label: 'SIMR (Nativo)' },
      { value: 'marc21', label: 'MARC 21' },
      { value: 'dublincore', label: 'Dublin Core' },
    ];
  }
}
