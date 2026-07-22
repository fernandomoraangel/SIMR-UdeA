import { AnotacionCartograficoTemporal } from '../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';

export interface VinculoRelacionado {
  etiqueta: string;
  url: string;
}

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

export interface ArchivoAdjunto {
  archivoId: string;
}

export interface SistemaRelacion {
  id: string;
  centro: string;
}

export interface ProyectoAsociado {
  proyecto: string | { _id: string; nombre: string };
}

export interface Sistema {
  _id: string;
  nombre: string;
  descripcion?: string;
  alias: { nombre: string }[];
  sistemasRelacionados: SistemaRelacion[];
  padres: SistemaRelacion[];
  hijos: SistemaRelacion[];
  proyectosAsociados: ProyectoAsociado[];
  anotacionCartograficoTemporal: AnotacionCartograficoTemporal[];
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

export interface CreateSistemaRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  sistemasRelacionados?: SistemaRelacion[];
  padres?: SistemaRelacion[];
  hijos?: SistemaRelacion[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateSistemaRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  sistemasRelacionados?: SistemaRelacion[];
  padres?: SistemaRelacion[];
  hijos?: SistemaRelacion[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
