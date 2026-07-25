import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { OpacService } from '../../../opac.service';
import { OpacInstrumentoResult } from '../../../opac.models';

@Component({
  selector: 'app-opac-instrumentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <p class="simr-eyebrow">Catálogo público</p>
        <h1>Instrumentos</h1>
      </header>

      <div class="opac-search">
        <mat-icon class="search-icon">music_note</mat-icon>
        <input
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="search()"
          placeholder="Buscar por nombre de instrumento…"
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
          <p>No se encontraron instrumentos con "{{ lastQuery }}"</p>
        </div>
      }

      <div class="opac-results">
        @for (inst of results(); track inst._id) {
          <div class="opac-card">
            <div class="card-header">
              <h2 class="card-title">{{ inst.nombre }}</h2>
              @if (inst.clasificacion) {
                <span class="card-badge">{{ inst.clasificacion }}</span>
              }
            </div>

            @if (inst.obras?.length) {
              <h3 class="section-title">Obras ({{ inst.obras.length }})</h3>
              @for (obra of inst.obras; track obra._id) {
                <div class="sub-card">
                  <div class="sub-card-header">
                    <a class="sub-card-title entity-link" [routerLink]="'/obras/' + obra._id">{{ obra.titulo }}</a>
                  </div>
                  @if (obra.recursos?.length) {
                    <div class="recursos-section">
                      @for (rec of obra.recursos; track rec._id) {
                        <div class="rec-card">
                          <a class="rec-card-title entity-link" [routerLink]="'/recursos/' + rec._id">
                            <mat-icon class="ej-link-icon">link</mat-icon>{{ rec.titulo }}
                          </a>
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
                    <span class="no-data">Sin recursos vinculados</span>
                  }
                </div>
              }
            } @else {
              <span class="no-data">No hay obras registradas con este instrumento</span>
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
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      background: #5c7a5a; color: white; padding: 0.1rem 0.45rem; border-radius: 3px;
    }
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
    .ej-link-icon { font-size: 12px; width: 12px; height: 12px; vertical-align: middle; margin-right: 2px; }
    .entity-link { color: var(--simr-cobre); text-decoration: none; cursor: pointer; }
    .entity-link:hover { text-decoration: underline; }

    .no-data { font-size: 0.75rem; color: var(--simr-tinta-2); font-style: italic; }
  `],
})
export class OpacInstrumentosComponent {
  private readonly opacService = inject(OpacService);

  query = '';
  lastQuery = '';
  loading = signal(false);
  error = signal('');
  results = signal<OpacInstrumentoResult[]>([]);
  searched = signal(false);

  search() {
    const q = this.query.trim();
    if (!q) return;
    this.lastQuery = q;
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.opacService.searchByInstrumento(q).subscribe({
      next: (res) => { this.results.set(res.results); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar instrumentos');
        this.loading.set(false);
      },
    });
  }
}
