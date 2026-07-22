export interface Diccionario {
  _id: string;
  tabla: string;
  campo: string;
  campoLargo: string;
  definicion: string;
  creador: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  creado: Date;
}

export interface CreateDiccionarioRequest {
  tabla: string;
  campo: string;
  campoLargo?: string;
  definicion: string;
}

export interface UpdateDiccionarioRequest {
  tabla: string;
  campo: string;
  campoLargo?: string;
  definicion: string;
}
