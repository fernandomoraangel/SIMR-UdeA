export interface Fondo {
  _id: string;
  nombre: string;
  tipo: string;
  propiedadComodato: string;
  fechaDeCreacion: string;
  precision: string;
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateFondoRequest {
  nombre: string;
  tipo?: string;
  propiedadComodato?: string;
  fechaDeCreacion?: string;
  precision?: string;
}

export interface UpdateFondoRequest {
  nombre: string;
  tipo?: string;
  propiedadComodato?: string;
  fechaDeCreacion?: string;
  precision?: string;
}
