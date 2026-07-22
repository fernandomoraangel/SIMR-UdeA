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

export interface ObraRelacionada {
  id: string;
}

export interface NumeroNormalizado {
  nombre: string;
  numero: string;
}

export interface MencionResponsabilidad {
  actor: any;
  tipoDeMencion: string;
}

export interface ContenedorAsociado {
  id: string;
}

export interface FuenteAsociada {
  tipoFuente: string;
  lugar: string;
  nombre: string;
  fecha: Date | string;
  precision: string;
}

export interface TipoDeRecurso {
  id: string;
}

export interface MateriaAsociada {
  id: string;
}

export interface IdiomaAsociado {
  id: string;
}

export interface DescripcionTecnica {
  criterio: string;
  valor: string;
}

export interface ProyectoAsociado {
  id: string;
}

export interface Recurso {
  _id: string;
  titulo: string;
  obrasRelacionadas: ObraRelacionada[];
  numeroNormalizado: NumeroNormalizado[];
  faceta?: string;
  mencionResponsabilidad: MencionResponsabilidad[];
  descripcion?: string;
  contenedores: ContenedorAsociado[];
  fuente: FuenteAsociada[];
  tiposDeRecurso: TipoDeRecurso[];
  anotacionCartograficoTemporal: AnotacionCartograficoTemporal[];
  materia: MateriaAsociada[];
  idiomas: IdiomaAsociado[];
  descripcionTecnica: DescripcionTecnica[];
  materialAcompanante?: string;
  mencionDeSerie?: string;
  proyectos: ProyectoAsociado[];
  vinculoRelacionado: VinculoRelacionado[];
  descriptorLibre: DescriptorLibre[];
  archivosAdjuntos: ArchivoAdjunto[];
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateRecursoRequest {
  titulo: string;
  obrasRelacionadas?: ObraRelacionada[];
  numeroNormalizado?: NumeroNormalizado[];
  faceta?: string;
  mencionResponsabilidad?: MencionResponsabilidad[];
  descripcion?: string;
  contenedores?: ContenedorAsociado[];
  fuente?: FuenteAsociada[];
  tiposDeRecurso?: TipoDeRecurso[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  materia?: MateriaAsociada[];
  idiomas?: IdiomaAsociado[];
  descripcionTecnica?: DescripcionTecnica[];
  materialAcompanante?: string;
  mencionDeSerie?: string;
  proyectos?: ProyectoAsociado[];
  vinculoRelacionado?: VinculoRelacionado[];
  descriptorLibre?: DescriptorLibre[];
  archivosAdjuntos?: ArchivoAdjunto[];
}

export interface UpdateRecursoRequest {
  titulo: string;
  obrasRelacionadas?: ObraRelacionada[];
  numeroNormalizado?: NumeroNormalizado[];
  faceta?: string;
  mencionResponsabilidad?: MencionResponsabilidad[];
  descripcion?: string;
  contenedores?: ContenedorAsociado[];
  fuente?: FuenteAsociada[];
  tiposDeRecurso?: TipoDeRecurso[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  materia?: MateriaAsociada[];
  idiomas?: IdiomaAsociado[];
  descripcionTecnica?: DescripcionTecnica[];
  materialAcompanante?: string;
  mencionDeSerie?: string;
  proyectos?: ProyectoAsociado[];
  vinculoRelacionado?: VinculoRelacionado[];
  descriptorLibre?: DescriptorLibre[];
  archivosAdjuntos?: ArchivoAdjunto[];
}
