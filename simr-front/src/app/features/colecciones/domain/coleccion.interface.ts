export interface Coleccion {
  _id: string;
  nombre: string;
  tipo?: string;
  fechaDeCreacion?: Date;
  precision?: string;
  propiedadComodato?: string;
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateColeccionRequest {
  nombre: string;
  tipo?: string;
  fechaDeCreacion?: Date;
  precision?: string;
  propiedadComodato?: string;
}

export interface UpdateColeccionRequest {
  nombre: string;
  tipo?: string;
  fechaDeCreacion?: Date;
  precision?: string;
  propiedadComodato?: string;
}
