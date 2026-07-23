export interface UsuarioSimple {
  _id: string;
  username: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  roles?: { name: string }[];
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
}

export interface EstadisticasUsoResponse {
  totalSesiones: number;
  sesionesActivas: number;
  promedioDuracionMinutos: number;
  sesionesPorModulo: Array<{ modulo: string; cantidad: number }>;
  usuariosTop: Array<{ usuario: string; sesiones: number }>;
  sesionesRecientes: SesionUso[];
}