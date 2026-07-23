export interface UsuarioSimple {
  _id: string;
  username: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  roles?: { _id: string; name: string }[];
  roleNames?: string[];
}

export interface AccionUso {
  entidad: string;
  tipoAccion: string;
  entidadId?: string;
  timestamp: Date;
}

export interface SesionUso {
  _id?: string;
  usuario: UsuarioSimple;
  ip: string;
  modulo: string;
  ruta?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  duracionSegundos?: number;
  activo: boolean;
  acciones?: AccionUso[];
}

export interface EstadisticasGenerales {
  totalSesiones: number;
  sesionesActivas: number;
  usuariosUnicos: number;
  promedioDuracionMinutos: number;
}

export interface EstadisticasModulo {
  modulo: string;
  sesiones: number;
  duracionTotalMinutos: number;
}

export interface EstadisticasRol {
  rol: string;
  usuariosUnicos: number;
  sesiones: number;
  duracionTotalMinutos: number;
}

export interface EstadisticasEntidad {
  entidad: string;
  total: number;
  acciones: Record<string, number>;
}

export interface SesionPorDia {
  fecha: string;
  sesiones: number;
  duracionTotalMinutos: number;
}

export interface TopUsuario {
  usuario: string;
  nombre: string;
  sesiones: number;
  duracionTotalMinutos: number;
  modulosVisitados: number;
}

export interface EstadisticasUsoData {
  generales: EstadisticasGenerales;
  porModulo: EstadisticasModulo[];
  porRol: EstadisticasRol[];
  porEntidad: EstadisticasEntidad[];
  sesionesPorDia: SesionPorDia[];
  topUsuarios: TopUsuario[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}