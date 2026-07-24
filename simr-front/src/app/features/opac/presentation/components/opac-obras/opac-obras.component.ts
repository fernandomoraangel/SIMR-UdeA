import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { OpacService } from '../../../opac.service';
import { OpacObra } from '../../../opac.models';

@Component({
  selector: 'app-opac-obras',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <h1>Buscador de obras</h1>
        <p class="opac-subtitle">Catálogo público — consulta obras musicales, sus recursos y ejemplares</p>
      </header>

      <div class="opac-search">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="search()"
          placeholder="Buscar obras por título…"
          class="search-input"
        />
        <button class="search-btn" (click)="search()" [disabled]="!query.trim()">Buscar</button>
      </div>

      @if (loading()) {
        <div class="opac-loading"><mat-icon>hourglass_top</mat-icon> Buscando…</div>
      }

      @if (error()) {
        <div class="opac-error">{{ error() }}</div>
      }

      @if (!loading() && !error() && results().length === 0 && searched()) {
        <div class="opac-empty">
          <mat-icon>search_off</mat-icon>
          <p>No se encontraron obras con "{{ lastQuery }}"</p>
        </div>
      }

      <div class="opac-results">
        @for (obra of results(); track obra._id) {
          <div class="opac-card">
            <div class="card-header">
              <h2 class="card-title">{{ obra.titulo }}</h2>
              @if (obra.tipo) {
                <span class="card-badge">{{ obra.tipo }}</span>
              }
            </div>

            @if (obra.denominacionRegional?.length) {
              <div class="card-regional">
                @for (dr of obra.denominacionRegional; track dr.denominacionRegional) {
                  <span class="regional-chip">{{ dr.denominacionRegional }}</span>
                }
              </div>
            }

            @if (obra.descripcion) {
              <p class="card-desc">{{ obra.descripcion }}</p>
            }

            <div class="card-meta">
              @if (obra.actores?.length) {
                <div class="meta-section">
                  <span class="meta-label">Actores:</span>
                  <span class="meta-value">{{ joinNames(obra.actores) || '—' }}</span>
                </div>
              }
              @if (obra.generosFormas?.length) {
                <div class="meta-section">
                  <span class="meta-label">Géneros:</span>
                  <span class="meta-value">{{ joinNames(obra.generosFormas) }}</span>
                </div>
              }
              @if (obra.materias?.length) {
                <div class="meta-section">
                  <span class="meta-label">Materias:</span>
                  <span class="meta-value">{{ joinNames(obra.materias) }}</span>
                </div>
              }
            </div>

            @if (obra.recursos?.length) {
              <div class="card-section">
                <h3 class="section-title">Recursos donde aparece esta obra ({{ obra.recursos.length }})</h3>
                @for (rec of obra.recursos; track rec._id) {
                  <div class="sub-card">
                    <div class="sub-card-header">
                      <span class="sub-card-title">{{ rec.titulo }}</span>
                    </div>
                    @if (rec.ejemplares?.length) {
                      <div class="ejemplares-list">
                        @for (ej of rec.ejemplares; track ej._id) {
                          <div class="ejemplar-item">
                            <span class="ej-num">{{ ej.numeroEjemplar || '—' }}</span>
                            <span class="ej-status" [class.disponible]="ej.disponibilidad === 'Disponible'">{{ ej.disponibilidad || '—' }}</span>
                            @if (ej.fondo) { <span class="ej-loc">{{ ej.fondo.nombre }}</span> }
                            @if (ej.coleccion) { <span class="ej-loc">{{ ej.coleccion.nombre }}</span> }
                          </div>
                        }
                      </div>
                    } @else {
                      <span class="no-data">Sin ejemplares registrados</span>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="card-section">
                <span class="no-data">No hay recursos vinculados a esta obra</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .opac-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .opac-header { margin-bottom: 1.5rem; }
    .opac-header h1 { margin: 0; font-size: 1.5rem; color: var(--simr-tinta); }
    .opac-subtitle { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--simr-tinta-2); }

    .opac-search {
      display: flex; gap: 0.5rem; align-items: center;
      background: var(--simr-hueso); padding: 0.75rem 1rem;
      border-radius: 12px; border: 1px solid var(--mat-sys-outline); margin-bottom: 1.5rem;
    }
    .search-icon { color: var(--simr-tinta-2); font-size: 20px; }
    .search-input {
      flex: 1; border: none; background: transparent; outline: none;
      font-size: 1rem; color: var(--simr-tinta);
    }
    .search-btn {
      padding: 0.5rem 1.25rem; border-radius: 8px; border: none;
      background: var(--simr-cobre); color: white; font-weight: 600;
      cursor: pointer; font-size: 0.85rem;
    }
    .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .opac-loading, .opac-empty {
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; padding: 3rem; color: var(--simr-tinta-2);
    }
    .opac-error { color: #b91c1c; padding: 1rem; text-align: center; }
    .opac-results { display: flex; flex-direction: column; gap: 1.25rem; }

    .opac-card {
      background: var(--simr-papel); border-radius: 14px;
      padding: 1.5rem; border: 1px solid var(--mat-sys-outline);
    }
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .card-title { margin: 0; font-size: 1.15rem; color: var(--simr-tinta); }
    .card-badge {
      font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
      background: var(--simr-cobre); color: white; padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .card-regional { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
    .regional-chip {
      font-size: 0.72rem; background: var(--simr-hueso); color: var(--simr-tinta-2);
      padding: 0.1rem 0.5rem; border-radius: 4px; font-style: italic;
    }
    .card-desc { font-size: 0.85rem; color: var(--simr-tinta-2); margin: 0 0 0.75rem; line-height: 1.4; }
    .card-meta { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.75rem; }
    .meta-section { font-size: 0.78rem; }
    .meta-label { font-weight: 600; color: var(--simr-tinta-2); margin-right: 0.35rem; }
    .meta-value { color: var(--simr-tinta); }

    .card-section { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--mat-sys-outline); }
    .section-title { font-size: 0.78rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--simr-tinta); }

    .sub-card {
      background: var(--simr-hueso); border-radius: 10px;
      padding: 0.75rem 1rem; margin-bottom: 0.5rem;
    }
    .sub-card-header { margin-bottom: 0.35rem; }
    .sub-card-title { font-size: 0.85rem; font-weight: 600; color: var(--simr-tinta); }

    .ejemplares-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .ejemplar-item {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.75rem; padding: 0.2rem 0;
    }
    .ej-num { font-family: 'IBM Plex Mono', monospace; color: var(--simr-tinta-2); min-width: 100px; }
    .ej-status {
      font-weight: 600; color: var(--simr-tinta-2);
    }
    .ej-status.disponible { color: #2e7d32; }
    .ej-loc { color: var(--simr-tinta-2); }
    .ej-loc::before { content: '·'; margin: 0 0.35rem; }

    .no-data { font-size: 0.75rem; color: var(--simr-tinta-2); font-style: italic; }
  `],
})
export class OpacObrasComponent {
  private readonly opacService = inject(OpacService);

  query = '';
  lastQuery = '';
  loading = signal(false);
  error = signal('');
  results = signal<OpacObra[]>([]);
  searched = signal(false);

  search() {
    const q = this.query.trim();
    if (!q) return;
    this.lastQuery = q;
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.opacService.searchObras(q).subscribe({
      next: (res) => { this.results.set(res.results); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar obras');
        this.loading.set(false);
      },
    });
  }

  joinNames(items: { nombre?: string }[]): string {
    return items.map(i => i.nombre).filter(n => !!n).join(', ');
  }
}
