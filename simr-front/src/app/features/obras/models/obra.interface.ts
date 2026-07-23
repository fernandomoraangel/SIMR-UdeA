import { AnotacionCartograficoTemporal } from '../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';

export interface DenominacionRegional {
  denominacionRegional: string;
  fuenteDenominacion: string;
}

export interface ContenedorAsociado {
  id: string;
}

export interface AsientoLigado {
  id: string;
  tipoDeRelacion: string;
  direccionDeRelacion: string;
  fuenteAutorRelacion: string;
  notaGeneral: string;
  proyectoRelacionado: string;
}

export interface ActorAsociado {
  id: string;
  rol: string;
}

export interface MateriaAsociada {
  id: string;
}

export interface MedioAsociado {
  id: string;
}

export interface SistemaAsociado {
  id: string;
  centro: string;
}

export interface IdiomaAsociado {
  id: string;
}

export interface GeneroFormaAsociado {
  id: string;
}

export interface ProyectoAsociado {
  id: string;
}

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

export interface Obra {
  _id: string;
  titulo: string;
  denominacionRegional: DenominacionRegional[];
  descripcion?: string;
  tipo?: string;
  contenedores: ContenedorAsociado[];
  asientoLigado: AsientoLigado[];
  generosFormas: GeneroFormaAsociado[];
  GenerosFormasNoMusicales: GeneroFormaAsociado[];
  materias: MateriaAsociada[];
  mediosSonoros: MedioAsociado[];
  sistemasSonoros: SistemaAsociado[];
  idiomas: IdiomaAsociado[];
  actores: ActorAsociado[];
  anotacionCartograficoTemporal: AnotacionCartograficoTemporal[];
  descriptores: DescriptorLibre[];
  proyectos: ProyectoAsociado[];
  vinculosRelacionados: VinculoRelacionado[];
  archivosAdjuntos: ArchivoAdjunto[];
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateObraRequest {
  titulo: string;
  denominacionRegional?: DenominacionRegional[];
  descripcion?: string;
  tipo?: string;
  contenedores?: ContenedorAsociado[];
  asientoLigado?: AsientoLigado[];
  generosFormas?: GeneroFormaAsociado[];
  GenerosFormasNoMusicales?: GeneroFormaAsociado[];
  materias?: MateriaAsociada[];
  mediosSonoros?: MedioAsociado[];
  sistemasSonoros?: SistemaAsociado[];
  idiomas?: IdiomaAsociado[];
  actores?: ActorAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptores?: DescriptorLibre[];
  proyectos?: ProyectoAsociado[];
  vinculosRelacionados?: VinculoRelacionado[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateObraRequest extends CreateObraRequest {}
