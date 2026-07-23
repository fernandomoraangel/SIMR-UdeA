import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface EntityCount {
  key: string;
  label: string;
  count: number;
}

interface FieldStat {
  filled: number;
  null: number;
  pct: number;
}

interface EntityFieldStats {
  key: string;
  label: string;
  total: number;
  fields: Record<string, FieldStat>;
}

interface SearchEntityStats {
  label: string;
  total: number;
  matches: number;
  pct: number;
  fields: Record<string, number>;
}

interface StatsResponse {
  entityCounts: EntityCount[];
  fieldStats?: Record<string, EntityFieldStats>;
  searchStats?: Record<string, SearchEntityStats>;
}

interface EntityOption {
  key: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-estadisticas-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatCheckboxModule,
  ],
  template: `
    <div class="dashboard">
      <header class="header">
        <p class="simr-eyebrow">Estadísticas</p>
        <h1>Estadísticas del Sistema</h1>
      </header>

      <div class="toolbar">
        <mat-card class="entity-selector-card" appearance="outlined">
          <div class="entity-selector-header" (click)="expanded = !expanded">
            <mat-icon>{{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            <span>Entidades ({{ selectedCount }}/{{ entities.length }})</span>
            <div class="entity-actions">
              <button class="btn-link" (click)="toggleAll(true); $event.stopPropagation()">Todo</button>
              <button class="btn-link" (click)="toggleAll(false); $event.stopPropagation()">Ninguno</button>
            </div>
          </div>
          @if (expanded) {
            <div class="entity-grid">
              @for (e of entities; track e.key) {
                <label class="entity-option">
                  <input type="checkbox" [checked]="e.selected" (change)="toggleEntity(e.key)" />
                  <span>{{ e.label }}</span>
                  <span class="entity-badge">{{ counts[e.key] ?? '…' }}</span>
                </label>
              }
            </div>
          }
        </mat-card>

        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Buscar término en todos los campos…"
            [(ngModel)]="searchTerm"
            (keyup.enter)="doSearch()"
          />
          @if (searchTerm) {
            <button class="btn-clear" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
          <button class="btn-search" (click)="doSearch()" [disabled]="!searchTerm || searching">Buscar</button>
        </div>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando estadísticas…</span>
        </div>
      }

      @if (error) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      }

      @if (!loading && !error) {

        @if (selectedEntities.length === 0 && !searchActive) {
          <div class="empty-state">
            <mat-icon>bar_chart</mat-icon>
            <p>Selecciona una o más entidades para ver sus estadísticas</p>
          </div>
        }

        @if (selectedEntities.length > 0 && !searchActive) {
          <div class="cards-grid">
            @for (item of visibleCounts; track item.key) {
              <mat-card class="stat-card" appearance="outlined" (click)="focusEntity(item.key)">
                <div class="stat-count">{{ item.count }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </mat-card>
            }
          </div>

          <div class="charts-grid">
            <mat-card class="chart-card" appearance="outlined">
              <div class="chart-header">
                <h2>Distribución</h2>
              </div>
              <div class="chart-wrapper">
                <canvas #statsChart></canvas>
              </div>
            </mat-card>

            <mat-card class="chart-card" appearance="outlined">
              <div class="chart-header">
                <h2>Proporción</h2>
              </div>
              <div class="chart-wrapper">
                <canvas #pieChart></canvas>
              </div>
            </mat-card>
          </div>

          @if (fieldStatsKeys.length > 0) {
            <mat-card class="field-stats-card" appearance="outlined">
              <div class="card-header">
                <h2>Completitud de campos</h2>
              </div>
              <div class="field-tabs">
                @for (key of fieldStatsKeys; track key) {
                  <button
                    class="field-tab"
                    [class.active]="activeFieldTab === key"
                    (click)="activeFieldTab = key"
                  >
                    {{ fieldStatsData[key].label }}
                    <span class="tab-badge">{{ fieldStatsData[key].total }}</span>
                  </button>
                }
              </div>
              @if (currentFieldStats) {
                <div class="field-table">
                  <div class="field-row header-row">
                    <span class="field-name">Campo</span>
                    <span class="field-count">Llenos</span>
                    <span class="field-null">Vacíos</span>
                    <span class="field-bar">% Completitud</span>
                    <span class="field-pct">%</span>
                  </div>
                  @for (f of currentFieldStats | keyvalue; track f.key) {
                    <div class="field-row">
                      <span class="field-name">{{ fieldLabel(f.key) }}</span>
                      <span class="field-count">{{ f.value.filled }}</span>
                      <span class="field-null">{{ f.value.null }}</span>
                      <span class="field-bar">
                        <div class="progress-track">
                          <div
                            class="progress-fill"
                            [style.width.%]="f.value.pct"
                            [class.low]="f.value.pct < 30"
                            [class.mid]="f.value.pct >= 30 && f.value.pct < 70"
                            [class.high]="f.value.pct >= 70"
                          ></div>
                        </div>
                      </span>
                      <span class="field-pct" [class.low]="f.value.pct < 30" [class.high]="f.value.pct >= 70">
                        {{ f.value.pct }}%
                      </span>
                    </div>
                  }
                </div>
              }
            </mat-card>
          }
        }

        @if (searchActive && searchKeys.length > 0) {
          <mat-card class="search-results-card" appearance="outlined">
            <div class="card-header">
              <h2>Resultados de búsqueda: «{{ searchTerm }}»</h2>
              <span class="result-summary">
                {{ totalSearchMatches }} coincidencias en {{ searchKeys.length }} entidades
              </span>
            </div>

            <div class="search-tabs">
              @for (key of searchKeys; track key) {
                <button
                  class="search-tab"
                  [class.active]="activeSearchTab === key"
                  (click)="activeSearchTab = key"
                >
                  {{ searchResults[key].label }}
                  <span class="tab-badge">{{ searchResults[key].matches }}</span>
                </button>
              }
            </div>

            @if (currentSearchResult) {
              <div class="search-summary-row">
                <div class="summary-stat">
                  <span class="summary-num">{{ currentSearchResult.total }}</span>
                  <span class="summary-label">Total docs</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-num">{{ currentSearchResult.matches }}</span>
                  <span class="summary-label">Coincidencias</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-num">{{ currentSearchResult.pct }}%</span>
                  <span class="summary-label">Cobertura</span>
                </div>
              </div>

              <div class="field-table">
                <div class="field-row header-row">
                  <span class="field-name">Campo</span>
                  <span class="field-count">Coincidencias</span>
                  <span class="field-bar">% del total</span>
                  <span class="field-pct">%</span>
                </div>
                @for (f of currentSearchResult.fields | keyvalue; track f.key) {
                  @let pct = currentSearchResult.total > 0 ? (f.value / currentSearchResult.total * 100) : 0;
                  <div class="field-row">
                    <span class="field-name">{{ fieldLabel(f.key) }}</span>
                    <span class="field-count">{{ f.value }}</span>
                    <span class="field-bar">
                      <div class="progress-track">
                        <div
                          class="progress-fill search-fill"
                          [style.width.%]="pct"
                        ></div>
                      </div>
                    </span>
                    <span class="field-pct">{{ pct.toFixed(1) }}%</span>
                  </div>
                }
              </div>
            }
          </mat-card>
        }

        @if (searchActive && searchKeys.length === 0 && !searching) {
          <div class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>Sin resultados para «{{ searchTerm }}»</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 1.5rem; }
    .header h1 { margin: 0.2em 0 0; }
    .loading { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .toolbar { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .entity-selector-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 0; overflow: hidden; }
    .entity-selector-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; cursor: pointer; user-select: none; background: var(--mat-sys-surface-container-low); font-weight: 500; }
    .entity-selector-header span { flex: 1; }
    .entity-actions { display: flex; gap: 0.5rem; }
    .btn-link { background: none; border: none; color: var(--simr-musgo); cursor: pointer; font-size: 0.8rem; text-decoration: underline; padding: 0; }
    .entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.25rem; padding: 0.5rem 1rem 1rem; }
    .entity-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .entity-option:hover { background: var(--mat-sys-surface-container-high); }
    .entity-option input { accent-color: var(--simr-musgo); }
    .entity-badge { margin-left: auto; background: var(--mat-sys-surface-container-high); padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.75rem; color: var(--simr-tinta-2); }
    .search-box { display: flex; align-items: center; gap: 0.5rem; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline); border-radius: 10px; padding: 0.5rem 1rem; }
    .search-box mat-icon { color: var(--simr-tinta-2); font-size: 1.2rem; }
    .search-box input { flex: 1; border: none; background: none; outline: none; font-size: 0.95rem; }
    .btn-clear { background: none; border: none; cursor: pointer; display: flex; align-items: center; padding: 0; color: var(--simr-tinta-2); }
    .btn-clear mat-icon { font-size: 1.1rem; }
    .btn-search { background: var(--simr-musgo); color: white; border: none; border-radius: 8px; padding: 0.4rem 1rem; cursor: pointer; font-size: 0.85rem; white-space: nowrap; }
    .btn-search:disabled { opacity: 0.5; cursor: default; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { text-align: center; padding: 1.25rem; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .stat-count { font-size: 2.25rem; font-weight: 700; color: var(--simr-musgo); }
    .stat-label { font-size: 0.82rem; color: var(--simr-tinta-2); margin-top: 0.25rem; text-transform: uppercase; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .chart-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 1.5rem; }
    .chart-header h2 { margin: 0 0 1rem; font-size: 1.25rem; color: var(--simr-tinta); }
    .chart-wrapper { position: relative; height: 300px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .card-header h2 { margin: 0; font-size: 1.25rem; color: var(--simr-tinta); }
    .result-summary { font-size: 0.85rem; color: var(--simr-tinta-2); }
    .field-stats-card, .search-results-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 1.5rem; margin-bottom: 2rem; }
    .field-tabs, .search-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .field-tab, .search-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--mat-sys-outline); background: transparent; cursor: pointer; font-size: 0.82rem; transition: all 0.15s; }
    .field-tab.active, .search-tab.active { background: var(--simr-musgo); color: white; border-color: var(--simr-musgo); }
    .tab-badge { background: var(--mat-sys-surface-container-high); padding: 0.05rem 0.4rem; border-radius: 10px; font-size: 0.72rem; }
    .active .tab-badge { background: rgba(255,255,255,0.2); color: white; }
    .field-table { display: flex; flex-direction: column; }
    .field-row { display: grid; grid-template-columns: 1.5fr 80px 80px 1fr 60px; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .header-row { font-size: 0.75rem; font-weight: 600; color: var(--simr-tinta-2); text-transform: uppercase; letter-spacing: 0.5px; padding: 0.4rem 0; }
    .field-name { font-size: 0.85rem; color: var(--simr-tinta); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .field-count, .field-null { font-size: 0.85rem; text-align: right; color: var(--simr-tinta-2); }
    .field-bar { padding: 0 0.25rem; }
    .progress-track { height: 8px; background: var(--mat-sys-surface-container-high); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; background: var(--simr-musgo); transition: width 0.5s ease; }
    .progress-fill.low { background: var(--simr-sello); }
    .progress-fill.mid { background: #c7952b; }
    .progress-fill.high { background: var(--simr-musgo); }
    .progress-fill.search-fill { background: var(--simr-musgo); }
    .field-pct { font-size: 0.85rem; font-weight: 600; text-align: right; color: var(--simr-tinta); }
    .field-pct.low { color: var(--simr-sello); }
    .field-pct.high { color: var(--simr-musgo); }
    .search-summary-row { display: flex; gap: 2rem; margin-bottom: 1rem; padding: 1rem; background: var(--mat-sys-surface-container-low); border-radius: 10px; }
    .summary-stat { display: flex; flex-direction: column; align-items: center; }
    .summary-num { font-size: 1.5rem; font-weight: 700; color: var(--simr-musgo); }
    .summary-label { font-size: 0.75rem; color: var(--simr-tinta-2); text-transform: uppercase; }
  `],
})
export class EstadisticasDashboardComponent implements OnInit, AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('statsChart', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieCanvasRef!: ElementRef<HTMLCanvasElement>;

  protected entities: EntityOption[] = [
    { key: 'obra', label: 'Obras', selected: false },
    { key: 'actor', label: 'Actores', selected: false },
    { key: 'recurso', label: 'Recursos', selected: false },
    { key: 'genero', label: 'Géneros', selected: false },
    { key: 'generonomusical', label: 'Géneros no musicales', selected: false },
    { key: 'materia', label: 'Materias', selected: false },
    { key: 'instrumento', label: 'Instrumentos', selected: false },
    { key: 'proyecto', label: 'Proyectos', selected: false },
    { key: 'medio', label: 'Medios', selected: false },
    { key: 'sistema', label: 'Sistemas', selected: false },
    { key: 'fondo', label: 'Fondos', selected: false },
    { key: 'coleccion', label: 'Colecciones', selected: false },
    { key: 'ejemplar', label: 'Ejemplares', selected: false },
    { key: 'idioma', label: 'Idiomas', selected: false },
    { key: 'diccionario', label: 'Diccionarios', selected: false },
    { key: 'user', label: 'Usuarios', selected: false },
  ];

  protected counts: Record<string, number> = {};
  protected fieldStatsData: Record<string, EntityFieldStats> = {};
  protected searchResults: Record<string, SearchEntityStats> = {};
  protected loading = true;
  protected searching = false;
  protected error = '';
  protected expanded = false;
  protected searchTerm = '';
  protected searchActive = false;
  protected activeFieldTab = '';
  protected activeSearchTab = '';

  private barChartInstance: Chart | null = null;
  private pieChartInstance: Chart | null = null;
  private viewInitialized = false;
  private allCounts: EntityCount[] = [];

  get selectedEntities(): string[] {
    return this.entities.filter(e => e.selected).map(e => e.key);
  }

  get selectedCount(): number {
    return this.selectedEntities.length;
  }

  get visibleCounts(): EntityCount[] {
    return this.allCounts.filter(c => this.selectedEntities.includes(c.key));
  }

  get fieldStatsKeys(): string[] {
    return Object.keys(this.fieldStatsData);
  }

  get currentFieldStats(): Record<string, FieldStat> | null {
    return this.fieldStatsData[this.activeFieldTab]?.fields ?? null;
  }

  get searchKeys(): string[] {
    return Object.keys(this.searchResults);
  }

  get currentSearchResult(): SearchEntityStats | null {
    return this.searchResults[this.activeSearchTab] ?? null;
  }

  get totalSearchMatches(): number {
    let total = 0;
    for (const r of Object.values(this.searchResults)) total += r.matches;
    return total;
  }

  ngOnInit() {
    this.http.get<StatsResponse>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.allCounts = data.entityCounts;
        for (const c of data.entityCounts) this.counts[c.key] = c.count;
        this.loading = false;
        this.cdr.detectChanges();
        this.tryCreateCharts();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar estadísticas';
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.tryCreateCharts();
  }

  private tryCreateCharts() {
    if (this.viewInitialized && !this.loading && this.allCounts.length > 0) {
      setTimeout(() => this.rebuildCharts());
    }
  }

  private rebuildCharts() {
    this.createBarChart();
    this.createPieChart();
  }

  toggleEntity(key: string) {
    const e = this.entities.find(x => x.key === key);
    if (!e) return;
    e.selected = !e.selected;
    if (!e.selected && this.activeFieldTab === key) {
      this.activeFieldTab = '';
    }
    this.loadFieldStats();
    this.createBarChart();
    this.createPieChart();
  }

  toggleAll(selected: boolean) {
    for (const e of this.entities) e.selected = selected;
    this.activeFieldTab = selected && this.entities.length > 0 ? this.entities[0].key : '';
    this.loadFieldStats();
    this.rebuildCharts();
  }

  focusEntity(key: string) {
    const e = this.entities.find(x => x.key === key);
    if (e) {
      e.selected = true;
      this.activeFieldTab = key;
      this.loadFieldStats();
      this.rebuildCharts();
    }
  }

  private loadFieldStats() {
    const sel = this.selectedEntities;
    if (sel.length === 0) {
      this.fieldStatsData = {};
      return;
    }
    const params = `entities=${sel.join(',')}&fields=true`;
    this.http.get<StatsResponse>(`${environment.apiUrl}/stats?${params}`).subscribe({
      next: (data) => {
        this.fieldStatsData = data.fieldStats ?? {};
        if (!this.activeFieldTab || !this.fieldStatsData[this.activeFieldTab]) {
          const keys = Object.keys(this.fieldStatsData);
          this.activeFieldTab = keys.length > 0 ? keys[0] : '';
        }
      },
    });
  }

  doSearch() {
    const term = this.searchTerm.trim();
    if (!term) return;
    this.searchActive = true;
    this.searching = true;
    const entities = this.selectedEntities;
    let url = `${environment.apiUrl}/stats?search=${encodeURIComponent(term)}`;
    if (entities.length > 0) url += `&entities=${entities.join(',')}`;

    this.http.get<StatsResponse>(url).subscribe({
      next: (data) => {
        this.searching = false;
        this.searchResults = {};
        if (data.searchStats) {
          for (const [key, val] of Object.entries(data.searchStats)) {
            if (val.matches > 0) this.searchResults[key] = val;
          }
          const keys = Object.keys(this.searchResults);
          this.activeSearchTab = keys.length > 0 ? keys[0] : '';
        }
      },
      error: () => { this.searching = false; },
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchActive = false;
    this.searchResults = {};
  }

  fieldLabel(key: string): string {
    const labels: Record<string, string> = {
      titulo: 'Título', descripcion: 'Descripción', tipo: 'Tipo',
      nombre: 'Nombre', alias: 'Alias', clasificacion: 'Clasificación',
      nombres: 'Nombres', apellidos: 'Apellidos', nombreReunion: 'Nombre de reunión',
      contenedor: 'Contenedor', faceta: 'Faceta',
      numeroNormalizado: 'N. Normalizado', mencionResponsabilidad: 'M. Responsabilidad',
      fuente: 'Fuente', tiposDeRecurso: 'Tipos de recurso',
      materia: 'Materia', idiomas: 'Idiomas', descripcionTecnica: 'Desc. técnica',
      materialAcompanante: 'Mat. acompañante', mencionDeSerie: 'M. de serie',
      proyectos: 'Proyectos', generosFormas: 'Géneros/Formas',
      materias: 'Materias', mediosSonoros: 'Medios sonoros',
      sistemasSonoros: 'Sistemas sonoros', actores: 'Actores',
      vinculosRelacionados: 'Vínculos', archivosAdjuntos: 'Archivos',
      descriptores: 'Descriptores', denominacionRegional: 'Denom. regional',
      instrumentos: 'Instrumentos', sistemasRelacionados: 'Sistemas rel.',
      investigadores: 'Investigadores', fechasAsociadas: 'Fechas asociadas',
      estado: 'Estado', descriptoresLibres: 'Desc. libres',
      vinculoRelacionado: 'Vínculo', generosRelacionados: 'Géneros rel.',
      materiasRelacionadas: 'Materias rel.', propiedadComodato: 'Propiedad',
      fechaDeCreacion: 'Fecha creación', precision: 'Precisión',
      recurso: 'Recurso', numeroEjemplar: 'N. ejemplar',
      disponibilidad: 'Disponibilidad', fondo: 'Fondo',
      coleccion: 'Colección', procedencia: 'Procedencia',
      estados: 'Estados', glottocode: 'Glottocode',
      isoCode: 'ISO Code', endonym: 'Endónimo',
      exonymSpanish: 'Exónimo (es)', linguisticFamily: 'Familia ling.',
      transmissionMode: 'Transmisión', territorialContext: 'Contexto terr.',
      tabla: 'Tabla', campo: 'Campo', campoLargo: 'Campo largo',
      definicion: 'Definición', username: 'Usuario',
      email: 'Email', firstName: 'Nombre', lastName: 'Apellido',
      proyectosAsociados: 'Proyectos',
      descriptorLibre: 'Desc. libre',
      idioma: 'Idioma',
    };
    return labels[key] || key;
  }

  private createBarChart() {
    if (this.barChartInstance) this.barChartInstance.destroy();
    this.barChartInstance = null;
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.visibleCounts;
    if (data.length === 0) return;

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(s => s.label),
        datasets: [{
          label: 'Cantidad',
          data: data.map(s => s.count),
          backgroundColor: 'rgba(84, 110, 122, 0.7)',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { ticks: { maxRotation: 45 } },
        },
      },
    });
  }

  private createPieChart() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    this.pieChartInstance = null;
    const ctx = this.pieCanvasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.visibleCounts;
    if (data.length === 0) return;

    const colors = ['#546E7A', '#BF5700', '#8C975B', '#4A452A', '#A32638',
      '#5B8C5A', '#C17817', '#3D5A80', '#98A886', '#6B4E3A'];

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(s => s.label),
        datasets: [{
          data: data.map(s => s.count),
          backgroundColor: data.map((_, i) => colors[i % colors.length]),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
        },
      },
    });
  }
}
