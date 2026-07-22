export interface GraphNode {
  id: string;
  entityId: string;
  entityType: string;
  label: string;
  color: string;
  data?: Record<string, unknown>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

export interface GraphMetadata {
  totalNodes: number;
  totalLinks: number;
  entityTypes: string[];
  colors: Record<string, string>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  metadata: GraphMetadata;
}

export interface GraphApiResponse {
  success: boolean;
  data: GraphData;
  message?: string;
}

export interface GraphMetadataResponse {
  success: boolean;
  metadata: {
    availableEntities: string[];
    colors: Record<string, string>;
    relationships: Record<string, Record<string, { target: string; field: string }>>;
    totalCounts: Record<string, number>;
  };
}

export interface EntityDisplay {
  key: string;
  name: string;
  color: string;
  count: number;
  selected: boolean;
}

export const ENTITY_DISPLAY_NAMES: Record<string, string> = {
  Obra: 'Obras',
  Actor: 'Actores',
  Recurso: 'Recursos',
  Genero: 'Géneros',
  GeneroNoMusical: 'Géneros No Musicales',
  Materia: 'Materias',
  Instrumento: 'Instrumentos',
  Proyecto: 'Proyectos',
  Medio: 'Medios',
  Sistema: 'Sistemas',
  Fondo: 'Fondos',
  Coleccion: 'Colecciones',
  Ejemplar: 'Ejemplares',
  Idioma: 'Idiomas',
  Diccionario: 'Diccionarios',
  Archivo: 'Archivos',
  Lista: 'Listas',
};

export const ENTITY_ROUTES: Record<string, string> = {
  Obra: '/obras',
  Actor: '/actores',
  Recurso: '/recursos',
  Genero: '/generos',
  GeneroNoMusical: '/generos-no-musicales',
  Materia: '/materias',
  Instrumento: '/instrumentos',
  Proyecto: '/proyectos',
  Medio: '/medios',
  Sistema: '/sistemas',
  Fondo: '/fondos',
  Coleccion: '/colecciones',
  Ejemplar: '/ejemplares',
  Idioma: '/idiomas',
  Diccionario: '/diccionarios',
  Archivo: '/files',
  Lista: '/listas',
};
