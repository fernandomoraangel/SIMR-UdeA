import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AnotacionMapComponent } from '../../../../../shared/anotaciones-cartograficas/anotacion-map/anotacion-map.component';
import { AnotacionCartograficoTemporal } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface AnotacionWithColor extends AnotacionCartograficoTemporal {
  color: string;
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
  selector: 'app-mapa-visualizador',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatCheckboxModule, AnotacionMapComponent],
  template: `
    <div class="visualizador-container">
      <header class="header">
        <h1>Visualizador Cartográfico</h1>
      </header>

      <div class="controls-card">
        <div class="search-bar">
          <input type="text" placeholder="Filtrar eventos o lugares..." [(ngModel)]="filterTerm" />
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

      <div class="map-card">
        <app-anotacion-map [anotaciones]="filteredAnotaciones()" />
      </div>
    </div>
  `,
  styles: [`
    .visualizador-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .controls-card { background: var(--simr-hueso); padding: 1.5rem; border-radius: 14px; margin-bottom: 1rem; border: 1px solid var(--mat-sys-outline); }
    .search-bar input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--mat-sys-outline); margin-bottom: 1rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 1rem; }
    .entity-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 0.5rem; }
    .entity-label { font-weight: 700; }
    .map-card { border-radius: 14px; overflow: hidden; border: 1px solid var(--mat-sys-outline); }
  `]
})
export class MapaVisualizadorComponent implements OnInit {
  private http = inject(HttpClient);
  filterTerm = '';
  
  entidades: EntidadItem[] = Object.keys(ENTIDAD_COLORS).map(key => ({
    key,
    label: ENTIDAD_LABELS[key] || key,
    selected: true,
    color: ENTIDAD_COLORS[key]
  }));

  allAnotaciones = signal<AnotacionWithColor[]>([]);
  
  filteredAnotaciones = computed(() => {
    const term = this.filterTerm.toLowerCase();
    return this.allAnotaciones().filter(a => 
      a.evento?.toLowerCase().includes(term) || a.lugar?.toLowerCase().includes(term)
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
    
    const requests = selected.map(e => {
      const backendKey = ENTIDAD_KEYS[e.key] || e.key;
      const entityColor = ENTIDAD_COLORS[e.key] || '#c8772e';
      return this.http.get<any[]>(`${environment.apiUrl}/${backendKey}`).pipe(
        map(items => items
          .filter(i => i.anotacionCartograficoTemporal && i.anotacionCartograficoTemporal.length > 0)
          .flatMap(i => i.anotacionCartograficoTemporal.map((a: any) => ({
            ...a, 
            entidadNombre: i.titulo || i.nombre || i.fullName || 'Sin nombre',
            entidadKey: e.key,
            color: entityColor
          })))
        ),
        catchError(() => of([]))
      );
    });

    const colors: Record<string, string> = ENTIDAD_COLORS;

    forkJoin(requests).subscribe(results => {
      const flattened = results.flat().map(a => ({
        ...a,
        color: a.color || colors[a.entidadKey || 'default'] || colors['default'] || '#c8772e'
      }));
      this.allAnotaciones.set(flattened);
    });
  }
}
