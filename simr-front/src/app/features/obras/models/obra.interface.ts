export interface Contexto {
  contexto: string;
  descripcion: string;
}

export interface ActorAsociado {
  actor: any;
  rol: string;
}

export interface NotaPrograma {
  titulo: string;
  contenido: string;
  fecha: Date | string;
}

export interface FechaAsociada {
  fecha: Date | string;
  tipo: string;
  descripcion: string;
}

export interface ArchivoAdjunto {
  archivo: string;
  descripcion: string;
}

export interface Anotacion {
  titulo: string;
  anotacion: string;
}

export interface Enlace {
  url: string;
  descripcion: string;
}

export interface Obra {
  _id: string;
  titulo: string;
  tituloOriginal?: string;
  lugarDeEjecucion?: string;
  anyoEstreno?: string;
  descripcion?: string;
  duracion?: string;
  estado?: string;
  tipoDeObra: string[];
  ambitoGeografico: string[];
  contextos: Contexto[];
  obrasVinculadas: any[];
  recursosVinculados: any[];
  actores: ActorAsociado[];
  proyectos: any[];
  generos: any[];
  instrumentos: any[];
  notasPrograma: NotaPrograma[];
  fechasAsociadas: FechaAsociada[];
  archivosAdjuntos: ArchivoAdjunto[];
  anotaciones: Anotacion[];
  descriptores: string[];
  enlaces: Enlace[];
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
  tituloOriginal?: string;
  lugarDeEjecucion?: string;
  anyoEstreno?: string;
  descripcion?: string;
  duracion?: string;
  estado?: string;
  tipoDeObra?: string[];
  ambitoGeografico?: string[];
  contextos?: Contexto[];
  obrasVinculadas?: any[];
  recursosVinculados?: any[];
  actores?: ActorAsociado[];
  proyectos?: any[];
  generos?: any[];
  instrumentos?: any[];
  notasPrograma?: NotaPrograma[];
  fechasAsociadas?: FechaAsociada[];
  archivosAdjuntos?: ArchivoAdjunto[];
  anotaciones?: Anotacion[];
  descriptores?: string[];
  enlaces?: Enlace[];
}

export interface UpdateObraRequest {
  titulo: string;
  tituloOriginal?: string;
  lugarDeEjecucion?: string;
  anyoEstreno?: string;
  descripcion?: string;
  duracion?: string;
  estado?: string;
  tipoDeObra?: string[];
  ambitoGeografico?: string[];
  contextos?: Contexto[];
  obrasVinculadas?: any[];
  recursosVinculados?: any[];
  actores?: ActorAsociado[];
  proyectos?: any[];
  generos?: any[];
  instrumentos?: any[];
  notasPrograma?: NotaPrograma[];
  fechasAsociadas?: FechaAsociada[];
  archivosAdjuntos?: ArchivoAdjunto[];
  anotaciones?: Anotacion[];
  descriptores?: string[];
  enlaces?: Enlace[];
}
