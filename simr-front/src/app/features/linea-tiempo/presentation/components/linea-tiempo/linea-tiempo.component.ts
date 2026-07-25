import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SweetAlertService } from '@core/services/sweet-alert.service';
import { AnotacionTimelineComponent } from '../../../../../shared/anotaciones-cartograficas/anotacion-timeline/anotacion-timeline.component';
import {
  AnotacionCartograficoTemporal,
  toDisplayFecha,
  formatDate,
} from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';

interface AnotacionWithMeta extends AnotacionCartograficoTemporal {
  color: string;
  entidadKey: string;
  entidadNombre: string;
}

interface EntidadItem {
  key: string;
  label: string;
  selected: boolean;
  color: string;
}

const ENTIDAD_COLORS: Record<string, string> = {
  obras: '#A32638', actores: '#BF5700', recursos: '#546E7A', proyectos: '#8C975B',
  generos: '#A07445', 'generos-no-musicales': '#5C6943', medios: '#823435', sistemas: '#AF8255',
  idiomas: '#6E7850', instrumentos: '#AF8255', fondos: '#6E7850', colecciones: '#96413C',
  ejemplares: '#374151', default: '#c8772e'
};

const ENTIDAD_LABELS: Record<string, string> = {
  obras: 'Obras',
  actores: 'Actores',
  recursos: 'Recursos',
  proyectos: 'Proyectos',
  generos: 'Géneros Musicales',
  'generos-no-musicales': 'Géneros No Musicales',
  medios: 'Medios sonoros',
  sistemas: 'Sistemas sonoros',
  idiomas: 'Idiomas',
  instrumentos: 'Instrumentos',
  fondos: 'Fondos',
  colecciones: 'Colecciones',
  ejemplares: 'Ejemplares'
};

const ENTIDAD_KEYS: Record<string, string> = {
  obras: 'obras',
  actores: 'actores',
  recursos: 'recursos',
  proyectos: 'proyectos',
  generos: 'generos',
  'generos-no-musicales': 'generosNoMusicales',
  medios: 'medios',
  sistemas: 'sistemas',
  idiomas: 'idiomas',
  instrumentos: 'instrumentos',
  fondos: 'fondos',
  colecciones: 'colecciones',
  ejemplares: 'ejemplares'
};

@Component({
  selector: 'app-linea-tiempo',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatCardModule, MatCheckboxModule,
    AnotacionTimelineComponent,
  ],
  template: `
    <div class="timeline-visualizador-container">
      <header class="header">
        <p class="simr-eyebrow">Visualización de datos</p>
        <h1>Visualizador de Línea de Tiempo</h1>
      </header>

      <div class="controls-card">
        <div class="search-bar">
          <input
            type="text"
            placeholder="Filtrar eventos, lugares..."
            [(ngModel)]="filterTerm"
          />
        </div>
        <div class="entity-selector">
          <h3>Entidades:</h3>
          <div class="chips">
            @for (entidad of entidades; track entidad.key) {
              <mat-checkbox [(ngModel)]="entidad.selected" (ngModelChange)="loadAnotaciones()">
                <span class="entity-dot" [style.background-color]="entidad.color"></span>
                {{ entidad.label }}
              </mat-checkbox>
            }
          </div>
        </div>
      </div>

      <div class="timeline-card">
        @if (loading()) {
          <div class="loading">
            <mat-icon>hourglass_top</mat-icon>
            <span>Cargando anotaciones...</span>
          </div>
        } @else {
          <app-anotacion-timeline
            [anotaciones]="filteredAnotaciones()"
            (edit)="onTimelineClick($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline-visualizador-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 1.5rem; }
    .header h1 { margin: 0; font-size: 1.5rem; color: var(--simr-tinta); }
    .subtitle { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--simr-tinta-2); }
    .controls-card {
      background: var(--simr-hueso);
      padding: 1.5rem;
      border-radius: 14px;
      margin-bottom: 1rem;
      border: 1px solid var(--mat-sys-outline);
    }
    .search-bar input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline);
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
    .entity-selector h3 { margin: 0 0 0.75rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .chips { display: flex; flex-wrap: wrap; gap: 1rem; }
    .entity-dot {
      width: 12px; height: 12px; border-radius: 50%;
      display: inline-block; margin-right: 0.5rem;
    }
    .timeline-card {
      background: var(--simr-papel);
      border-radius: 14px;
      padding: 1.5rem;
      border: 1px solid var(--mat-sys-outline);
    }
    .loading {
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; padding: 3rem;
      color: var(--simr-tinta-2);
    }
  `],
})
export class LineaTiempoComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly sweetAlert = inject(SweetAlertService);

  filterTerm = '';

  entidades: EntidadItem[] = Object.keys(ENTIDAD_COLORS).map(key => ({
    key,
    label: ENTIDAD_LABELS[key] || key,
    selected: true,
    color: ENTIDAD_COLORS[key]
  }));

  allAnotaciones = signal<AnotacionWithMeta[]>([]);
  loading = signal(false);

  filteredAnotaciones = computed(() => {
    const term = this.filterTerm.toLowerCase();
    return this.allAnotaciones().filter(a =>
      a.evento?.toLowerCase().includes(term) ||
      a.lugar?.toLowerCase().includes(term) ||
      a.entidadNombre?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadAnotaciones();
  }

  loadAnotaciones() {
    const selected = this.entidades.filter(e => e.selected);
    if (selected.length === 0) {
      this.allAnotaciones.set([]);
      return;
    }

    this.loading.set(true);

    const requests = selected.map(e => {
      const backendKey = ENTIDAD_KEYS[e.key] || e.key;
      const entityColor = ENTIDAD_COLORS[e.key] || '#c8772e';
      return this.http.get<any[]>(`${environment.apiUrl}/${backendKey}`).pipe(
        map(items => items
          .filter(i => i.anotacionCartograficoTemporal && i.anotacionCartograficoTemporal.length > 0)
          .flatMap(i => i.anotacionCartograficoTemporal.map((a: any) => {
            let nombre = i.titulo || i.nombre || i.fullName || '';
            if (!nombre && i.nombres) nombre = `${i.nombres || ''} ${i.apellidos || ''}`.trim();
            return {
              ...a,
              entidadNombre: nombre || 'Sin nombre',
              entidadKey: e.key,
              entidadLabel: e.label,
              color: entityColor,
            };
          }))
        ),
        catchError(() => of([]))
      );
    });

    forkJoin(requests).subscribe(results => {
      const flattened = results.flat();
      this.allAnotaciones.set(flattened);
      this.loading.set(false);
    });
  }

  onTimelineClick(index: number) {
    const list = this.allAnotaciones();
    const a = list[index];
    if (!a) return;

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const rows: string[] = [];

    const tipoEntidad = ENTIDAD_LABELS[a.entidadKey] || a.entidadKey || '';
    if (tipoEntidad) {
      rows.push(`<div style="font-size:0.6rem;color:#8f9080;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1px">${esc(tipoEntidad)}</div>`);
    }

    if (a.entidadNombre) {
      rows.push(`<div style="font-size:0.9rem;font-weight:600;color:#2f3d35;margin-bottom:6px">${esc(a.entidadNombre)}</div>`);
    }

    if (a.evento) {
      rows.push(`<div style="font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:1rem;color:#1f2a24;border-bottom:1px solid #cdbfa6;padding-bottom:5px;margin-bottom:7px;letter-spacing:-0.01em">${esc(a.evento)}</div>`);
    }

    if (a.lugar) {
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Lugar</span><span style="color:#1f2a24">${esc(a.lugar)}</span></div>`);
    }

    if (a.coberturaAmplitud) {
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Cobertura</span><span style="font-style:italic;color:#2f3d35">${esc(a.coberturaAmplitud)}</span></div>`);
    }

    if (a.fechaInicio) {
      const f = toDisplayFecha(a.fechaInicio);
      const [y, m, d] = f.split('/');
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Inicio</span><span style="color:#1f2a24">${formatDate(y, m, d, a.precisionInicio || 'AMD')}</span></div>`);
    }

    if (a.fechaFin) {
      const f = toDisplayFecha(a.fechaFin);
      const [y, m, d] = f.split('/');
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Fin</span><span style="color:#1f2a24">${formatDate(y, m, d, a.precisionFin || 'AMD')}</span></div>`);
    }

    if (a.evidencia) {
      rows.push(`<div style="font-size:0.78rem;color:#4a5a50;border-top:1px solid #e7ded0;padding-top:5px;margin-top:5px;font-style:italic">${esc(a.evidencia)}</div>`);
    }

    if (a.coordenadas && a.coordenadas.length >= 2) {
      const lat = Number(a.coordenadas[1]);
      const lng = Number(a.coordenadas[0]);
      if (!isNaN(lat) && !isNaN(lng)) {
        rows.push(`<div style="font-size:0.65rem;color:#8f9080;margin-top:3px;font-family:'IBM Plex Mono',monospace">${lat.toFixed(4)}°N · ${lng.toFixed(4)}°W</div>`);
      }
    }

    this.sweetAlert.showInfoHtml(rows.join(''), 'Anotación cartográfico-temporal');
  }
}
