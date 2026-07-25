import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { OpacService } from '../../../opac.service';
import { OpacRolResult } from '../../../opac.models';

@Component({
  selector: 'app-opac-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <p class="simr-eyebrow">Catálogo público</p>
        <h1>Roles</h1>
      </header>

      <div class="opac-search">
        <mat-icon class="search-icon">badge</mat-icon>
        <input
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="search()"
          placeholder="Buscar por rol (autor, compositor, intérprete…)…"
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
          <p>No se encontraron roles con "{{ lastQuery }}"</p>
        </div>
      }

      <div class="opac-results">
        @for (grupo of results(); track grupo.rol) {
          <div class="opac-card">
            <div class="card-header">
              <span class="role-header">{{ grupo.rol }}</span>
              <span class="role-count">{{ grupo.actores.length }} actor{{ grupo.actores.length !== 1 ? 'es' : '' }}</span>
            </div>

            @for (actor of grupo.actores; track actor._id) {
              <div class="actor-group">
                <div class="actor-header">
                  <mat-icon class="actor-icon">person</mat-icon>
                  <a class="actor-name entity-link" [routerLink]="'/actores/' + actor._id">{{ actor.nombre || '—' }}</a>
                </div>
                @if (actor.obras?.length) {
                  <div class="obras-list">
                    @for (obra of actor.obras; track obra._id) {
                      <a class="obra-chip entity-link" [routerLink]="'/obras/' + obra._id">
                        <mat-icon class="ej-link-icon">link</mat-icon>{{ obra.titulo }}
                      </a>
                    }
                  </div>
                } @else {
                  <span class="no-data">Sin obras registradas</span>
                }
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
    .card-header {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1rem; padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--mat-sys-outline);
    }
    .role-header {
      font-size: 1rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--simr-cobre);
    }
    .role-count { font-size: 0.72rem; color: var(--simr-tinta-2); }

    .actor-group {
      margin-bottom: 0.75rem; padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--mat-sys-outline);
    }
    .actor-group:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .actor-header { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.4rem; }
    .actor-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-tinta-2); }
    .actor-name { font-size: 0.85rem; font-weight: 600; }

    .obras-list { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .obra-chip {
      font-size: 0.72rem; background: var(--simr-hueso);
      padding: 0.2rem 0.5rem; border-radius: 4px;
      color: var(--simr-tinta);
    }

    .ej-link-icon { font-size: 11px; width: 11px; height: 11px; vertical-align: middle; margin-right: 2px; }
    .entity-link { color: var(--simr-cobre); text-decoration: none; cursor: pointer; }
    .entity-link:hover { text-decoration: underline; }
    .no-data { font-size: 0.75rem; color: var(--simr-tinta-2); font-style: italic; }
  `],
})
export class OpacRolesComponent {
  private readonly opacService = inject(OpacService);

  query = '';
  lastQuery = '';
  loading = signal(false);
  error = signal('');
  results = signal<OpacRolResult[]>([]);
  searched = signal(false);

  search() {
    const q = this.query.trim();
    if (!q) return;
    this.lastQuery = q;
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.opacService.searchByRole(q).subscribe({
      next: (res) => { this.results.set(res.results); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar roles');
        this.loading.set(false);
      },
    });
  }
}
