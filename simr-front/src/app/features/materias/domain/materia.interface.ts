export interface VinculoRelacionado {
  etiqueta: string;
  url: string;
}

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

export interface MateriaRelacionada {
  id: string | { _id: string; nombre: string };
  nombre?: string;
}

export interface ArchivoAdjunto {
  archivoId: string;
}

export interface Materia {
  _id: string;
  nombre: string;
  alias: { nombre: string }[];
  materiasRelacionadas: MateriaRelacionada[];
  padres: MateriaRelacionada[];
  hijos: MateriaRelacionada[];
  descripcion: string;
  descriptorLibre: DescriptorLibre[];
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

export interface CreateMateriaRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  materiasRelacionadas?: MateriaRelacionada[];
  padres?: MateriaRelacionada[];
  hijos?: MateriaRelacionada[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateMateriaRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  materiasRelacionadas?: MateriaRelacionada[];
  padres?: MateriaRelacionada[];
  hijos?: MateriaRelacionada[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
