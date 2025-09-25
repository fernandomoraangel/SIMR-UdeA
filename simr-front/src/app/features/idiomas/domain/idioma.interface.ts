export interface Idioma {
  _id: string;
  idioma: string;
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateIdiomaRequest {
  idioma: string;
}

export interface UpdateIdiomaRequest {
  idioma: string;
}

export interface IdiomasResponse {
  message?: string;
  data?: Idioma[];
}
