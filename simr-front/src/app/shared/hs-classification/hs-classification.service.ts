import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface HsNode {
  code: string;
  name: string;
  description: string;
  instruments: string[];
  children: HsNode[];
}

export interface HsTaxonomy {
  version: string;
  roots: HsNode[];
}

export interface UniversalInstrument {
  name: string;
  code: string;
}

export interface HsSearchResult {
  code: string;
  name: string;
  path: string;
  description: string;
}

export interface HsCodeSegment {
  code: string;
  name: string;
  isSuffix: boolean;
}

const SUFFIXES: Record<string, string> = {
  '1': 'con arco',
  '2': 'accionado con bandas o cintas',
  '3': 'accionado con fuelle',
  '4': 'con mango o palanca',
  '5': 'tocado con los dedos al descubierto',
  '6': 'tocado con púa',
  '7': 'tocado con arco',
  '71': 'con arco (genérico)',
  '72': 'con rueda',
  '73': 'con cinta o banda',
  '8': 'con teclado',
  '9': 'con accionamiento mecánico',
  '92': 'con accionamiento mecánico (caja de música)',
};

const SPANISH_NAMES: Record<string, string> = {
  '1': 'Idiófonos',
  '11': 'Idiófonos por percusión',
  '111': 'Idiófonos por percusión directa',
  '112': 'Idiófonos por percusión indirecta (sacudidos)',
  '12': 'Idiófonos punteados',
  '13': 'Idiófonos por frotación',
  '14': 'Idiófonos soplados',
  '2': 'Membranófonos',
  '21': 'Membranófonos por percusión',
  '211': 'Membranófonos por percusión directa (tambores)',
  '212': 'Membranófonos por percusión indirecta (sacudidos)',
  '22': 'Membranófonos punteados',
  '23': 'Membranófonos por frotación',
  '24': 'Membranófonos cantados',
  '3': 'Cordófonos',
  '31': 'Cordófonos simples o cítaras',
  '311': 'Cítaras de barra',
  '312': 'Cítaras de tubo',
  '313': 'Cítaras de balsa',
  '314': 'Cítaras de tabla',
  '315': 'Cítaras de artesa',
  '316': 'Cítaras de marco',
  '317': 'Cítaras de arpa',
  '32': 'Cordófonos compuestos',
  '321': 'Laúdes',
  '322': 'Arpas',
  '33': 'Cordófonos de tensión variable',
  '4': 'Aerófonos',
  '41': 'Aerófonos libres',
  '411': 'Aerófonos libres de desplazamiento',
  '412': 'Aerófonos libres de lengüeta',
  '413': 'Aerófonos libres de bisel',
  '414': 'Aerófonos libres de percusión',
  '42': 'Instrumentos de viento no libres (propiamente dichos)',
  '421': 'Flautas',
  '422': 'Instrumentos de lengüeta',
  '423': 'Trompetas',
  '5': 'Electrófonos',
  '51': 'Electrófonos analógicos',
  '52': 'Electrófonos digitales',
  '53': 'Instrumentos electroacústicos',
  '321.1': 'Laúdes de arco',
  '321.2': 'Laúdes de yugo',
  '321.3': 'Laúdes de mango',
  '321.31': 'Laúdes de mango (propiamente dichos)',
  '321.32': 'Laúdes de mango con caja en forma de guitarra',
  '321.321': 'Laúdes de mango con cuerpo en forma de pera',
  '321.322': 'Guitarras',
  '321.33': 'Laúdes de mango con caja en forma de laúd',
  '422.1': 'Instrumentos de lengüeta simple',
  '422.2': 'Instrumentos de lengüeta doble',
  '422.3': 'Instrumentos de lengüeta libre',
  '423.1': 'Trompetas naturales',
  '423.2': 'Trompetas cromáticas',
  '421.1': 'Flautas de pico',
  '421.2': 'Flautas traversas',
  '421.3': 'Flautas de Pan',
  '111.1': 'Golpeadores (idiófonos percutidos directamente)',
  '111.2': 'Percutidos entre sí (choque)',
  '112.1': 'Sacudidos',
  '112.2': 'Raspadores',
  '112.3': 'Frotados (percusión indirecta)',
  '211.1': 'Tambores de golpeo directo (tocados con baqueta o mano)',
  '211.2': 'Tambores de frotación (con baqueta frotada)',
  '211.3': 'Tambores de percusión indirecta (sacudidos)',
};

@Injectable({ providedIn: 'root' })
export class HsClassificationService {
  private readonly http = inject(HttpClient);

  private taxonomy: HsTaxonomy | null = null;
  private universals: UniversalInstrument[] = [];
  private nodeMap = new Map<string, HsNode>();

  async load(): Promise<void> {
    if (this.taxonomy) return;
    const [tax, univ] = await Promise.all([
      firstValueFrom(this.http.get<HsTaxonomy>('/angular/assets/data/hs-taxonomy.json')),
      firstValueFrom(this.http.get<{ version: string; instruments: UniversalInstrument[] }>('/angular/assets/data/hs-universal-instruments.json')),
    ]);
    this.taxonomy = tax;
    this.universals = univ.instruments;
    this.indexNodes(tax.roots);
  }

  private indexNodes(nodes: HsNode[]): void {
    for (const n of nodes) {
      this.nodeMap.set(n.code, n);
      this.indexNodes(n.children);
    }
  }

  getRoots(): HsNode[] {
    return this.taxonomy?.roots ?? [];
  }

  getNode(code: string): HsNode | undefined {
    return this.nodeMap.get(code);
  }

  getAllNodes(): HsNode[] {
    const result: HsNode[] = [];
    function walk(nodes: HsNode[]) {
      for (const n of nodes) {
        result.push(n);
        walk(n.children);
      }
    }
    if (this.taxonomy) walk(this.taxonomy.roots);
    return result;
  }

  getPath(code: string): HsNode[] {
    const path: HsNode[] = [];
    const node = this.nodeMap.get(code);
    if (!node) return path;
    path.push(node);
    const parents = this.getAllNodes().filter(n => {
      if (n.children.some(c => c.code === code)) return true;
      return false;
    });
    if (parents.length > 0) {
      return [...this.getPath(parents[0].code), node];
    }
    return path;
  }

  findUniversal(name: string): UniversalInstrument | null {
    if (!name || name.length < 2) return null;
    const query = name.toLowerCase().trim();
    let best: UniversalInstrument | null = null;
    let bestScore = 0;
    for (const inst of this.universals) {
      const instName = inst.name.toLowerCase();
      if (instName === query) return inst;
      if (instName.includes(query) && query.length > 2) {
        const score = query.length / instName.length;
        if (score > bestScore) { bestScore = score; best = inst; }
      }
    }
    return best;
  }

  search(query: string): HsSearchResult[] {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const results: HsSearchResult[] = [];
    const all = this.getAllNodes();
    for (const n of all) {
      if (n.code.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)) {
        const path = this.getPath(n.code).map(p => this.getSpanishName(p.code)).join(' › ');
        results.push({ code: n.code, name: this.getSpanishName(n.code), path, description: n.description.slice(0, 120) });
      }
    }
    return results.slice(0, 50);
  }

  getSuffixes(): Record<string, string> {
    return SUFFIXES;
  }

  getLeaves(node: HsNode): HsNode[] {
    if (!node.children || node.children.length === 0) return [node];
    const leaves: HsNode[] = [];
    for (const c of node.children) {
      leaves.push(...this.getLeaves(c));
    }
    return leaves;
  }

  getSpanishName(code: string): string {
    const exactMatch = SPANISH_NAMES[code];
    if (exactMatch) return exactMatch;

    const node = this.nodeMap.get(code);
    if (!node) return code;

    return this.englishToSpanishFallback(node.name);
  }

  private englishToSpanishFallback(name: string): string {
    const common: Record<string, string> = {
      'idiophone': 'idiófono', 'idiophones': 'idiófonos',
      'membranophone': 'membranófono', 'membranophones': 'membranófonos',
      'chordophone': 'cordófono', 'chordophones': 'cordófonos',
      'aerophone': 'aerófono', 'aerophones': 'aerófonos',
      'electrophone': 'electrófono', 'electrophones': 'electrófonos',
      'lute': 'laúd', 'lutes': 'laúdes',
      'harp': 'arpa', 'harps': 'arpas',
      'lyre': 'lira', 'lyres': 'liras',
      'zither': 'cítara', 'zithers': 'cítaras',
      'drum': 'tambor', 'drums': 'tambores',
      'flute': 'flauta', 'flutes': 'flautas',
      'trumpet': 'trompeta', 'trumpets': 'trompetas',
      'horn': 'trompa', 'horns': 'trompas',
      'reed': 'lengüeta', 'reeds': 'lengüetas',
      'clarinet': 'clarinete', 'clarinets': 'clarinetes',
      'oboe': 'oboe', 'oboes': 'oboes',
      'bassoon': 'fagot', 'bassoons': 'fagotes',
      'saxophone': 'saxofón', 'saxophones': 'saxofones',
      'violin': 'violín', 'violins': 'violines',
      'viola': 'viola', 'violas': 'violas',
      'cello': 'violonchelo', 'cellos': 'violonchelos',
      'double bass': 'contrabajo', 'double basses': 'contrabajos',
      'harpsichord': 'clavecín', 'harpsichords': 'clavecinos',
      'piano': 'piano', 'pianos': 'pianos',
      'organ': 'órgano', 'organs': 'órganos',
      'accordion': 'acordeón', 'accordions': 'acordeones',
      'guitar': 'guitarra', 'guitars': 'guitarras',
      'banjo': 'banjo',
      'mandolin': 'mandolina', 'mandolins': 'mandolinas',
      'bow': 'arco',
      'plectrum': 'púa',
      'keyboard': 'teclado',
      'string': 'cuerda', 'strings': 'cuerdas',
      'percussion': 'percusión',
      'friction': 'frotación',
      'plucked': 'punteado', 'pluck': 'puntear',
      'struck': 'percutido',
      'free': 'libre',
      'simple': 'simple',
      'composite': 'compuesto',
      'frame': 'marco',
      'tube': 'tubo',
      'bar': 'barra',
      'board': 'tabla',
      'trough': 'artesa',
      'raft': 'balsa',
      'yoke': 'yugo',
      'handle': 'mango',
      'neck': 'mástil',
      'true': 'propiamente dicho',
      'natural': 'natural',
      'chromatic': 'cromático',
    };

    let result = name;
    const words = name.split(/\s+/);
    result = words.map(w => {
      const clean = w.replace(/[^a-zA-Záéíóúñ]/g, '');
      if (common[clean]) {
        const suffix = w.slice(clean.length);
        return common[clean] + suffix;
      }
      if (clean.endsWith('s') && common[clean.slice(0, -1)]) {
        const suffix = w.slice(clean.length);
        const singular = common[clean.slice(0, -1)];
        if (singular.endsWith('a')) return singular.slice(0, -1) + 'as' + suffix;
        if (singular.endsWith('o')) return singular.slice(0, -1) + 'os' + suffix;
        return singular + 's' + suffix;
      }
      return w;
    }).join(' ');

    result = result.replace(/ or /g, ' o ');
    result = result.replace(/ and /g, ' y ');
    result = result.replace(/ with /g, ' con ');
    result = result.replace(/'plucked drums'/g, '"tambores punteados"');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  }

  getCodeBreakdown(fullCode: string): HsCodeSegment[] {
    const segments: HsCodeSegment[] = [];
    if (!fullCode) return segments;

    let baseCode = fullCode;

    const suffixMatch = fullCode.match(/-(\d+)$/);
    let suffix = '';
    if (suffixMatch) {
      suffix = suffixMatch[1];
      baseCode = fullCode.slice(0, -(suffixMatch[0].length));
    }

    const parts = baseCode.split('.');
    let accumulated = '';
    for (const part of parts) {
      if (accumulated) accumulated += '.';
      accumulated += part;
      const node = this.nodeMap.get(accumulated);
      const name = node
        ? this.getSpanishName(accumulated)
        : this.englishToSpanishFallback(accumulated);
      segments.push({ code: accumulated, name, isSuffix: false });
    }

    if (suffix) {
      const suffixName = SUFFIXES[suffix] || `sufijo ${suffix}`;
      segments.push({ code: `-${suffix}`, name: suffixName, isSuffix: true });
    }

    return segments;
  }
}
