export interface ContenedorAsociado {
  id: string;
}

export interface AnotacionCT {
  lugar?: any;
  coordenadas?: number[];
  evento?: string;
  coberturaAmplitud?: any;
  fechaInicio?: string;
  fechaFin?: string;
  precisionInicio?: string;
  precisionFin?: string;
  evidencia?: any;
}

export interface DescriptorItem {
  etiqueta: string;
  contenido: string;
}

export interface VinculoItem {
  etiqueta: string;
  url: string;
}

export interface ArchivoAdjunto {
  archivo: string;
  descripcion: string;
}

export interface Actor {
  _id: string;
  nombres?: string;
  apellidos?: string;
  nombreArtistico?: string;
  fullName: string;
  nombreReunion?: string;
  contenedor: ContenedorAsociado[];
  anotacionCartograficoTemporal: AnotacionCT[];
  descriptores: DescriptorItem[];
  vinculoRelacionado: VinculoItem[];
  archivosAdjuntos: ArchivoAdjunto[];
  registroOperacion?: any[];
  creador: { _id: string; firstName: string; lastName: string; fullName: string };
  creado: string;
}

export function formatActorName(actor: any): string {
  if (!actor) return '';
  if (typeof actor === 'string') return actor;
  const nombres = actor.nombres?.trim() || '';
  const apellidos = actor.apellidos?.trim() || '';
  const artistico = actor.nombreArtistico?.trim() || '';
  const reunion = actor.nombreReunion?.trim() || '';

  const nameSurname = [nombres, apellidos].filter(Boolean).join(' ');

  if (nameSurname && artistico) {
    return `${nameSurname} (${artistico})`;
  }
  if (nameSurname) {
    return nameSurname;
  }
  if (artistico) {
    return artistico;
  }
  if (reunion) {
    return reunion;
  }
  return actor.fullName || '';
}
