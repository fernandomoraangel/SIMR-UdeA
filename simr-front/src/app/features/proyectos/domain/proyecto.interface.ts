export interface Investigador {
  id: string;
  nombre?: string;
  rol: string;
  activoDesde?: Date | string;
  precisionActivoDesde?: string;
  activoHasta?: Date | string;
  precisionActivoHasta?: string;
}

export interface FechaAsociada {
  fecha: Date | string;
  evento: string;
  precision: string;
}

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

export interface VinculoRelacionado {
  etiqueta: string;
  url: string;
}

export interface ArchivoAdjunto {
  archivoId: string;
}

export interface Proyecto {
  _id: string;
  nombre: string;
  investigadores: Investigador[];
  fechasAsociadas: FechaAsociada[];
  estado: string;
  descriptoresLibres: DescriptorLibre[];
  vinculoRelacionado: VinculoRelacionado[];
  archivosAdjuntos: ArchivoAdjunto[];
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateProyectoRequest {
  nombre: string;
  estado?: string;
  investigadores?: Investigador[];
  fechasAsociadas?: FechaAsociada[];
  descriptoresLibres?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateProyectoRequest {
  nombre: string;
  estado?: string;
  investigadores?: Investigador[];
  fechasAsociadas?: FechaAsociada[];
  descriptoresLibres?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
