import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { OpacService } from '../../../opac.service';
import { OpacActor } from '../../../opac.models';

@Component({
  selector: 'app-opac-actores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <h1>Buscador de autores</h1>
        <p class="opac-subtitle">Catálogo público — consulta autores, sus obras, recursos, ejemplares y proyectos</p>
      </header>

      <div class="opac-search">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="search()"
          placeholder="Buscar autores por nombre…"
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
          <p>No se encontraron autores con "{{ lastQuery }}"</p>
        </div>
      }

      <div class="opac-results">
        @for (actor of results(); track actor._id) {
          <div class="opac-card">
            <div class="card-header">
              <h2 class="card-title">{{ actor.fullName || actor.nombreReunion }}</h2>
              @if (actor.nombreReunion) {
                <span class="card-badge">Reunión</span>
              }
            </div>

            @if (actor.obras?.length) {
              <div class="card-section">
                <h3 class="section-title">Obras ({{ actor.obras.length }})</h3>
                @for (obra of actor.obras; track obra._id) {
                  <div class="sub-card">
                    <div class="sub-card-header">
                      <span class="sub-card-title">{{ obra.titulo }}</span>
                    </div>
                    @if (obra.recursos?.length) {
                      <div class="recursos-section">
                        @for (rec of obra.recursos; track rec._id) {
                          <div class="rec-card">
                            <span class="rec-card-title">{{ rec.titulo }}</span>
                            @if (rec.ejemplares?.length) {
                              <div class="ejemplares-list">
                                @for (ej of rec.ejemplares; track ej._id) {
                                  <div class="ej-item">
                                    <span class="ej-num">{{ ej.numeroEjemplar || '—' }}</span>
                                    <span class="ej-status" [class.disp]="ej.disponibilidad === 'Disponible'">{{ ej.disponibilidad || '—' }}</span>
                                    @if (ej.fondo) { <span class="ej-loc">{{ ej.fondo.nombre }}</span> }
                                    @if (ej.coleccion) { <span class="ej-loc">{{ ej.coleccion.nombre }}</span> }
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
                      <span class="no-data">Sin recursos vinculados</span>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="card-section">
                <span class="no-data">No se encontraron obras para este autor</span>
              </div>
            }

            @if (actor.proyectos?.length) {
              <div class="card-section">
                <h3 class="section-title">Proyectos ({{ actor.proyectos.length }})</h3>
                <div class="proyectos-list">
                  @for (p of actor.proyectos; track p._id) {
                    <div class="proyecto-item">
                      <span class="proyecto-nombre">{{ p.nombre }}</span>
                      @if (p.descripcion) {
                        <span class="proyecto-desc">{{ p.descripcion }}</span>
                      }
                    </div>
                  }
                </div>
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
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .card-title { margin: 0; font-size: 1.15rem; color: var(--simr-tinta); }
    .card-badge {
      font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
      background: #6b8e23; color: white; padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .card-section { margin-top: 0.75rem; }
    .section-title { font-size: 0.78rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--simr-tinta); }

    .sub-card {
      background: var(--simr-hueso); border-radius: 10px;
      padding: 0.75rem 1rem; margin-bottom: 0.5rem;
    }
    .sub-card-header { margin-bottom: 0.35rem; }
    .sub-card-title { font-size: 0.85rem; font-weight: 600; color: var(--simr-tinta); }

    .recursos-section { margin-top: 0.4rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .rec-card {
      background: var(--simr-papel); border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .rec-card-title { font-size: 0.8rem; font-weight: 600; color: var(--simr-tinta); display: block; margin-bottom: 0.3rem; }
    .ejemplares-list { display: flex; flex-direction: column; gap: 0.15rem; }
    .ej-item {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; padding: 0.1rem 0;
    }
    .ej-num { font-family: 'IBM Plex Mono', monospace; color: var(--simr-tinta-2); min-width: 90px; }
    .ej-status { font-weight: 600; color: var(--simr-tinta-2); }
    .ej-status.disp { color: #2e7d32; }
    .ej-loc { color: var(--simr-tinta-2); }
    .ej-loc::before { content: '·'; margin: 0 0.35rem; }

    .proyectos-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .proyecto-item {
      background: var(--simr-hueso); border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .proyecto-nombre { font-size: 0.82rem; font-weight: 600; color: var(--simr-tinta); display: block; }
    .proyecto-desc { font-size: 0.75rem; color: var(--simr-tinta-2); }

    .no-data { font-size: 0.75rem; color: var(--simr-tinta-2); font-style: italic; }
  `],
})
export class OpacActoresComponent {
  private readonly opacService = inject(OpacService);

  query = '';
  lastQuery = '';
  loading = signal(false);
  error = signal('');
  results = signal<OpacActor[]>([]);
  searched = signal(false);

  search() {
    const q = this.query.trim();
    if (!q) return;
    this.lastQuery = q;
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.opacService.searchActores(q).subscribe({
      next: (res) => { this.results.set(res.results); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar autores');
        this.loading.set(false);
      },
    });
  }
}
