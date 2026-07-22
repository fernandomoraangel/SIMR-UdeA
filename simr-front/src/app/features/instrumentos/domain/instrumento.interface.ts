import { AnotacionCartograficoTemporal } from '../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';

export interface ArchivoAdjunto {
  archivoId: string;
}

export interface ProyectoAsociado {
  proyecto: string | { _id: string; nombre: string };
}

export interface VinculoRelacionado {
  etiqueta: string;
  url: string;
}

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

export interface Instrumento {
  _id: string;
  nombre: string;
  clasificacion: string;
  alias: { nombre: string }[];
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

export interface CreateInstrumentoRequest {
  nombre: string;
  clasificacion?: string;
  alias?: { nombre: string }[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateInstrumentoRequest {
  nombre: string;
  clasificacion?: string;
  alias?: { nombre: string }[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
