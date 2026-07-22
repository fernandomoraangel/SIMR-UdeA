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

export interface InstrumentoRol {
  instrumento: string | { _id: string; nombre: string };
  cantidad: number;
  rol: string;
}

export interface ProyectoAsociado {
  proyecto: string | { _id: string; nombre: string };
}

export interface Medio {
  _id: string;
  nombre: string;
  alias: { nombre: string }[];
  instrumentos: InstrumentoRol[];
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

export interface CreateMedioRequest {
  nombre: string;
  alias?: { nombre: string }[];
  instrumentos?: InstrumentoRol[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateMedioRequest {
  nombre: string;
  alias?: { nombre: string }[];
  instrumentos?: InstrumentoRol[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
