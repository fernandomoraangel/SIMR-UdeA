// SEPARAR INTERFACES EN ARCHIVOS DIFERENTES
export interface RegistroOperacion {
  tipoDeOperacion: string;
  registroBorrado?: boolean;
  campo?: any;
  fecha?: Date; // default: Date.now,
  usuario?: string; // Assuming 'usuario' is a reference to a User by ID
}

export interface ContenedorAsociado {
  id: string; // Assuming 'id' is a reference to another Actor by ID
}

export interface AnotacionCartograficoTemporal {
  lugar?: any;
  coordenadas?: number[];
  evento?: string;
  coberturaAmplitud?: any;
  fechaInicio?: Date;
  fechaFin?: Date;
  precisionInicio?: string;
  precisionFin?: string;
  evidencia?: any;
}

export interface VinculoRelacionado {
  etiqueta?: any;
  url?: any;
}

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

export interface Actor {
  _id?: string;
  nombres: string;
  apellidos: string;
  nombreReunion?: string;
  contenedor?: ContenedorAsociado[];
  anotacionCartograficoTemporal?: AnotacionCartograficoTemporal[];
  descriptores?: DescriptorLibre[];
  vinculoRelacionado?: VinculoRelacionado[];
  creador?: string; // Assuming 'creador' is a reference to a User by ID
  creado?: Date;
  registroOperacion?: RegistroOperacion[];
  fullName?: string; // Virtual property
}