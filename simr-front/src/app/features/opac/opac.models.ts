export interface OpacActorRef {
  _id: string;
  nombre: string;
  rol?: string;
}

export interface OpacGeneroRef {
  _id: string;
  nombre: string;
}

export interface OpacMateriaRef {
  _id: string;
  nombre: string;
}

export interface OpacEjemplar {
  _id: string;
  numeroEjemplar?: string;
  disponibilidad?: string;
  procedencia?: string;
  fondo?: { _id: string; nombre: string } | null;
  coleccion?: { _id: string; nombre: string } | null;
}

export interface OpacRecurso {
  _id: string;
  titulo: string;
  ejemplares: OpacEjemplar[];
}

export interface OpacObra {
  _id: string;
  titulo: string;
  denominacionRegional?: { denominacionRegional: string; fuenteDenominacion: string }[];
  descripcion?: string;
  tipo?: string;
  actores: OpacActorRef[];
  generosFormas: OpacGeneroRef[];
  materias: OpacMateriaRef[];
  recursos: OpacRecurso[];
}

export interface OpacObraResult {
  _id: string;
  titulo: string;
  actores: OpacActorRef[];
  recursos: OpacRecurso[];
}

export interface OpacActor {
  _id: string;
  nombres: string;
  apellidos: string;
  nombreReunion?: string;
  fullName: string;
  obras: OpacObraResult[];
  proyectos: { _id: string; nombre: string; descripcion?: string }[];
}

export interface OpacFondoColeccion {
  _id: string;
  tipoEntidad: string;
  nombre: string;
  tipo?: string;
  propiedadComodato?: string;
  fechaDeCreacion?: string;
  precision?: string;
  recursos: (OpacRecurso & { obras: { _id: string; titulo: string; actores: OpacActorRef[] }[] })[];
  actores: OpacActorRef[];
}

export interface OpacResponse<T> {
  results: T[];
}
