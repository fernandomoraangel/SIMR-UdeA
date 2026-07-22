import { AnotacionCartograficoTemporal } from '../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';

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

export interface Idioma {
  _id: string;
  idioma: string;
  glottocode?: string;
  isoCode?: string;
  endonym?: string;
  exonymSpanish?: string;
  linguisticFamily?: string;
  transmissionMode?: string;
  territorialContext?: string;
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
  creador: { _id: string; firstName: string; lastName: string; fullName: string };
  creado: Date;
}

export interface CreateIdiomaRequest {
  idioma: string;
  glottocode?: string;
  isoCode?: string;
  endonym?: string;
  exonymSpanish?: string;
  linguisticFamily?: string;
  transmissionMode?: string;
  territorialContext?: string;
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateIdiomaRequest {
  idioma: string;
  glottocode?: string;
  isoCode?: string;
  endonym?: string;
  exonymSpanish?: string;
  linguisticFamily?: string;
  transmissionMode?: string;
  territorialContext?: string;
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
