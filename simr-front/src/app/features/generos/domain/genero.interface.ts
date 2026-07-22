import { AnotacionCartograficoTemporal } from '../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import { AutocompleteItem } from '../../../shared/autocomplete-create/autocomplete-create.component';

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

export interface GeneroRelacion {
  id: string;
}

export interface ProyectoAsociado {
  proyecto: string | { _id: string; nombre: string };
}

export interface Genero {
  _id: string;
  nombre: string;
  descripcion?: string;
  alias: { nombre: string }[];
  generoRelacionado: GeneroRelacion[];
  padres: GeneroRelacion[];
  hijos: GeneroRelacion[];
  idioma: AutocompleteItem[];
  sistemasSonoros: AutocompleteItem[];
  mediosSonoros: AutocompleteItem[];
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

export interface CreateGeneroRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  generoRelacionado?: GeneroRelacion[];
  padres?: GeneroRelacion[];
  hijos?: GeneroRelacion[];
  idioma?: AutocompleteItem[];
  sistemasSonoros?: AutocompleteItem[];
  mediosSonoros?: AutocompleteItem[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateGeneroRequest {
  nombre: string;
  descripcion?: string;
  alias?: { nombre: string }[];
  generoRelacionado?: GeneroRelacion[];
  padres?: GeneroRelacion[];
  hijos?: GeneroRelacion[];
  idioma?: AutocompleteItem[];
  sistemasSonoros?: AutocompleteItem[];
  mediosSonoros?: AutocompleteItem[];
  proyectosAsociados?: ProyectoAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptorLibre?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
