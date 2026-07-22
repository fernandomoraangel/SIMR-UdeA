export interface EstadoRelacionado {
  etiqueta: string;
  contenido: string;
}

export interface Ejemplar {
  _id: string;
  recurso: string;
  numeroEjemplar: string;
  disponibilidad: string;
  fondo?: string;
  coleccion?: string;
  procedencia?: string;
  estados: EstadoRelacionado[];
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateEjemplarRequest {
  recurso?: string;
  numeroEjemplar: string;
  disponibilidad?: string;
  fondo?: string;
  coleccion?: string;
  procedencia?: string;
  estados?: EstadoRelacionado[];
}

export interface UpdateEjemplarRequest {
  recurso?: string;
  numeroEjemplar: string;
  disponibilidad?: string;
  fondo?: string;
  coleccion?: string;
  procedencia?: string;
  estados?: EstadoRelacionado[];
}
