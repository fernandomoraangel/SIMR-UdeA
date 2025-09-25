export interface Diccionario {
  _id?: string;
  tabla: string;
  campo: string;
  campoLargo: string;
  definicion: string;
  creado?: Date;
  creador?: {
    id: string;
    fullName: string;
  };
}

export interface CreateDiccionarioDto {
  tabla: string;
  campo: string;
  campoLargo: string;
  definicion: string;
}

export interface UpdateDiccionarioDto extends CreateDiccionarioDto {
  _id: string;
}

// export interface Diccionario {
//   _id?: string;
//   tabla: string;
//   campo?: string;
//   campoLargo?: string;
//   definicion: string;
//   creado?: Date;
// creador?: {
//   id: string;
//   fullName: string;
// };
// }

// export interface CreateDiccionarioDto {
//   tabla: string;
//   campo: string;
//   campoLargo: string;
//   definicion: string;
// }

// export interface UpdateDiccionarioDto extends Partial<CreateDiccionarioDto> {
//   _id: string;
// }
