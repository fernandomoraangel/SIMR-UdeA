export interface AnotacionCartograficoTemporal {
  _id?: string;
  lugar?: string;
  coordenadas?: number[];
  evento?: string;
  coberturaAmplitud?: string;
  fechaInicio?: string;
  fechaFin?: string;
  precisionInicio?: string;
  precisionFin?: string;
  evidencia?: string;
  entidadNombre?: string;
  color?: string;
}

export function precisionFecha(fecha: string): { fecha: string; precision: string } {
  const parts = (fecha || '').split('/');
  let anio = parts[0] || '0';
  let mes = parts[1] || '0';
  let dia = parts[2] || '0';
  let precision = 'AMD';

  if (anio === '0' || !anio) { precision = precision.replace('A', ''); anio = '3000'; }
  if (mes === '0' || !mes) { precision = precision.replace('M', ''); mes = '1'; }
  if (dia === '0' || !dia) { precision = precision.replace('D', ''); dia = '1'; }

  return { fecha: `${anio}/${mes}/${dia}`, precision: precision || 'A' };
}

export function formatDate(anio: string, mes: string, dia: string, precision: string): string {
  const p = precision || 'AMD';
  const hasA = p.includes('A');
  const hasM = p.includes('M');
  const hasD = p.includes('D');

  if (hasA && hasM && hasD) {
    const d = new Date(+anio, +mes - 1, +dia);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (hasA && hasM) {
    const d = new Date(+anio, +mes - 1);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
  }
  if (hasA) return anio;
  if (hasM && hasD) {
    const d = new Date(2000, +mes - 1, +dia);
    return d.toLocaleDateString('es-CO', { month: 'long', day: 'numeric' });
  }
  if (hasM) {
    const d = new Date(2000, +mes - 1);
    return d.toLocaleDateString('es-CO', { month: 'long' });
  }
  return '';
}

export function formatAnotacionParaDisplay(a: AnotacionCartograficoTemporal): string {
  const parts: string[] = [];
  if (a.lugar) parts.push(`Lugar: ${a.lugar}`);
  if (a.coberturaAmplitud) parts.push(`Cobertura: ${a.coberturaAmplitud}`);
  if (a.evento) parts.push(`Evento: ${a.evento}`);
  if (a.fechaInicio) {
    const f = toDisplayFecha(a.fechaInicio);
    const [y, m, d] = f.split('/');
    parts.push(`Inicio: ${formatDate(y, m, d, a.precisionInicio || 'AMD')}`);
  }
  if (a.fechaFin) {
    const f = toDisplayFecha(a.fechaFin);
    const [y, m, d] = f.split('/');
    parts.push(`Fin: ${formatDate(y, m, d, a.precisionFin || 'AMD')}`);
  }
  if (a.evidencia) parts.push(`Evidencia: ${a.evidencia}`);
  return parts.join('; ');
}

export function toDisplayFecha(value: string): string {
  if (!value) return '';
  if (value.includes('-')) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return `${y}/${m < 10 ? '0' + m : m}/${day < 10 ? '0' + day : day}`;
  }
  return value;
}
