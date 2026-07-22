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

export interface GeneroNoMusicalRelacion {
  id: string;
}

export interface GeneroNoMusical {
  _id: string;
  nombre: string;
  descripcion?: string;
  alias: { nombre: string }[];
  generosRelacionados: GeneroNoMusicalRelacion[];
  padres: GeneroNoMusicalRelacion[];
  hijos: GeneroNoMusicalRelacion[];
  anotacionCartograficoTemporal: AnotacionCartograficoTemporal[];
  idioma: { _id: string; idioma: string }[];
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

export interface CreateGeneroNoMusicalRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  generosRelacionados?: GeneroNoMusicalRelacion[];
  padres?: GeneroNoMusicalRelacion[];
  hijos?: GeneroNoMusicalRelacion[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  idioma?: { _id: string }[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateGeneroNoMusicalRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  generosRelacionados?: GeneroNoMusicalRelacion[];
  padres?: GeneroNoMusicalRelacion[];
  hijos?: GeneroNoMusicalRelacion[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  idioma?: { _id: string }[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
