import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { OpacService } from '../../../opac.service';
import { OpacObra } from '../../../opac.models';

@Component({
  selector: 'app-opac-multi',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <p class="simr-eyebrow">Catálogo público</p>
        <h1>Búsqueda avanzada</h1>
      </header>

      <div class="multi-form">
        <div class="form-row">
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">music_note</mat-icon> Obra</label>
            <input type="text" [(ngModel)]="filters.obra" placeholder="Título de la obra…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">person</mat-icon> Actor</label>
            <input type="text" [(ngModel)]="filters.actor" placeholder="Nombre del actor…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">badge</mat-icon> Rol del actor</label>
            <input type="text" [(ngModel)]="filters.rol" placeholder="autor, compositor, intérprete…" class="field-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">category</mat-icon> Género</label>
            <input type="text" [(ngModel)]="filters.genero" placeholder="Pasillo, Bambuco…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">inventory_2</mat-icon> Recurso</label>
            <input type="text" [(ngModel)]="filters.recurso" placeholder="Partitura, Audio…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">straighten</mat-icon> Instrumento</label>
            <input type="text" [(ngModel)]="filters.instrumento" placeholder="Guitarra, Marimba…" class="field-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">book</mat-icon> Materia</label>
            <input type="text" [(ngModel)]="filters.materia" placeholder="Música tradicional…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">speaker</mat-icon> Medio sonoro</label>
            <input type="text" [(ngModel)]="filters.medio" placeholder="Nombre del medio…" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label"><mat-icon class="f-icon">settings_input_component</mat-icon> Sistema sonoro</label>
            <input type="text" [(ngModel)]="filters.sistema" placeholder="Nombre del sistema…" class="field-input" />
          </div>
        </div>
        <div class="form-actions">
          <button class="search-btn" (click)="search()" [disabled]="!hasAnyFilter()">
            <mat-icon>search</mat-icon> Buscar
          </button>
          <button class="clear-btn" (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Limpiar
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="opac-loading"><mat-icon>hourglass_top</mat-icon> Buscando…</div>
      }

      @if (error()) {
        <div class="opac-error">{{ error() }}</div>
      }

      @if (!loading() && searched() && results().length === 0) {
        <div class="opac-empty">
          <mat-icon>search_off</mat-icon>
          <p>No se encontraron obras con los criterios especificados</p>
        </div>
      }

      @if (results().length) {
        <div class="results-summary">{{ results().length }} resultado(s) encontrado(s)</div>
        <div class="opac-results">
          @for (obra of results(); track obra._id) {
            <div class="opac-card">
              <div class="card-header">
                <a class="card-title entity-link" [routerLink]="'/obras/' + obra._id">{{ obra.titulo }}</a>
              </div>
              <div class="card-meta">
                @if (obra.actores?.length) {
                  <div class="meta-section">
                    <span class="meta-label">Actores:</span>
                    @for (a of obra.actores; track a.id || a._id) {
                      <span class="actor-with-role">
                        <a class="entity-link" [routerLink]="'/actores/' + (a.id || a._id)">{{ a.nombre || '—' }}</a>
                        @if (a.rol) { <span class="role-badge">{{ a.rol }}</span> }
                      </span>
                    }
                  </div>
                }
                @if (obra.generosFormas?.length) {
                  <div class="meta-section">
                    <span class="meta-label">Géneros:</span>
                    @for (g of obra.generosFormas; track g.id || g._id) {
                      <a class="entity-link" [routerLink]="'/generos/' + (g.id || g._id)">{{ g.nombre }}</a>
                    }
                  </div>
                }
                @if (obra.materias?.length) {
                  <div class="meta-section">
                    <span class="meta-label">Materias:</span>
                    @for (m of obra.materias; track m.id || m._id) {
                      <a class="entity-link" [routerLink]="'/materias/' + (m.id || m._id)">{{ m.nombre }}</a>
                    }
                  </div>
                }
              </div>
              @if (obra.recursos?.length) {
                <div class="card-section">
                  <h3 class="section-title">Recursos ({{ obra.recursos.length }})</h3>
                  @for (rec of obra.recursos; track rec._id) {
                    <div class="sub-card">
                      <a class="sub-card-title entity-link" [routerLink]="'/recursos/' + rec._id">{{ rec.titulo }}</a>
                      @if (rec.ejemplares?.length) {
                        <div class="ejemplares-list">
                          @for (ej of rec.ejemplares; track ej._id) {
                            <div class="ej-item">
                              <a class="ej-num entity-link" [routerLink]="'/ejemplares/' + ej._id">
                                <mat-icon class="ej-link-icon">link</mat-icon>{{ ej.numeroEjemplar || '—' }}
                              </a>
                              <span class="ej-status" [class.disp]="ej.disponibilidad === 'Disponible'">{{ ej.disponibilidad || '—' }}</span>
                            </div>
                          }
                        </div>
                      } @else {
                        <span class="no-data">Sin ejemplares</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="card-section">
                  <span class="no-data">Sin recursos vinculados</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .opac-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .opac-header { margin-bottom: 1.5rem; }
    .opac-header h1 { margin: 0; font-size: 1.5rem; color: var(--simr-tinta); }
    .opac-subtitle { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--simr-tinta-2); }

    .multi-form {
      background: var(--simr-hueso); border-radius: 14px;
      padding: 1.25rem; border: 1px solid var(--mat-sys-outline); margin-bottom: 1.5rem;
    }
    .form-row { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .form-row:last-of-type { margin-bottom: 1rem; }
    .field-group { flex: 1; min-width: 0; }
    .field-label {
      display: flex; align-items: center; gap: 0.3rem;
      font-size: 0.72rem; font-weight: 600; color: var(--simr-tinta-2);
      margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .f-icon { font-size: 14px; width: 14px; height: 14px; }
    .field-input {
      width: 100%; padding: 0.45rem 0.6rem; border-radius: 8px;
      border: 1px solid var(--mat-sys-outline); background: var(--simr-papel);
      font-size: 0.82rem; color: var(--simr-tinta); box-sizing: border-box;
    }
    .field-input:focus { outline: none; border-color: var(--simr-cobre); }
    .form-actions { display: flex; gap: 0.5rem; }
    .search-btn {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.5rem 1.25rem; border-radius: 8px; border: none;
      background: var(--simr-cobre); color: white; font-weight: 600;
      cursor: pointer; font-size: 0.85rem;
    }
    .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .clear-btn {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--mat-sys-outline);
      background: transparent; color: var(--simr-tinta-2); font-weight: 600;
      cursor: pointer; font-size: 0.85rem;
    }
    .clear-btn:hover { background: var(--simr-hueso); }

    .opac-loading, .opac-empty {
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; padding: 3rem; color: var(--simr-tinta-2);
    }
    .opac-error { color: #b91c1c; padding: 1rem; text-align: center; }
    .results-summary { font-size: 0.8rem; color: var(--simr-tinta-2); margin-bottom: 0.75rem; }
    .opac-results { display: flex; flex-direction: column; gap: 1.25rem; }

    .opac-card {
      background: var(--simr-papel); border-radius: 14px;
      padding: 1.5rem; border: 1px solid var(--mat-sys-outline);
    }
    .card-header { margin-bottom: 0.5rem; }
    .card-title { margin: 0; font-size: 1.15rem; }
    .card-meta { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.75rem; }
    .meta-section { font-size: 0.78rem; }
    .meta-label { font-weight: 600; color: var(--simr-tinta-2); margin-right: 0.35rem; }
    .card-section { padding-top: 0.75rem; border-top: 1px solid var(--mat-sys-outline); }
    .section-title { font-size: 0.78rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--simr-tinta); }

    .actor-with-role { display: inline-flex; align-items: center; gap: 0.35rem; margin-right: 0.5rem; white-space: nowrap; }
    .role-badge {
      font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      background: #9b8c6e; color: white; padding: 0.08rem 0.4rem; border-radius: 3px;
    }

    .sub-card {
      background: var(--simr-hueso); border-radius: 10px;
      padding: 0.75rem 1rem; margin-bottom: 0.5rem;
    }
    .sub-card-title { font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.3rem; }
    .ejemplares-list { display: flex; flex-direction: column; gap: 0.15rem; }
    .ej-item {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; padding: 0.1rem 0;
    }
    .ej-num { font-family: 'IBM Plex Mono', monospace; color: var(--simr-tinta-2); min-width: 90px; }
    .ej-status { font-weight: 600; color: var(--simr-tinta-2); }
    .ej-status.disp { color: #2e7d32; }
    .ej-link-icon { font-size: 12px; width: 12px; height: 12px; vertical-align: middle; margin-right: 2px; }
    .entity-link { color: var(--simr-cobre); text-decoration: none; cursor: pointer; }
    .entity-link:hover { text-decoration: underline; }
    .no-data { font-size: 0.75rem; color: var(--simr-tinta-2); font-style: italic; }
  `],
})
export class OpacMultiComponent {
  private readonly opacService = inject(OpacService);

  filters = {
    obra: '', actor: '', rol: '', genero: '', recurso: '',
    instrumento: '', materia: '', medio: '', sistema: '',
  };

  loading = signal(false);
  error = signal('');
  results = signal<OpacObra[]>([]);
  searched = signal(false);

  hasAnyFilter(): boolean {
    return Object.values(this.filters as Record<string, string>).some(v => v.trim());
  }

  search() {
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.filters as Record<string, string>)) {
      if (v.trim()) params[k] = v.trim();
    }
    if (!Object.keys(params).length) return;

    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.opacService.searchMulti(params).subscribe({
      next: (res) => { this.results.set(res.results); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar');
        this.loading.set(false);
      },
    });
  }

  clearFilters() {
    this.filters = { obra: '', actor: '', rol: '', genero: '', recurso: '', instrumento: '', materia: '', medio: '', sistema: '' };
    this.results.set([]);
    this.searched.set(false);
    this.error.set('');
  }
}
