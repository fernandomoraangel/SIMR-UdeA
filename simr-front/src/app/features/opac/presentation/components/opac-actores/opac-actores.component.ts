import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { OpacService } from '../../../opac.service';
import { OpacActor } from '../../../opac.models';
import { formatActorName } from '../../../../actores/models/actor.interface';

@Component({
  selector: 'app-opac-actores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="opac-page">
      <header class="opac-header">
        <h1>Buscador de actores</h1>
        <p class="opac-subtitle">Catálogo público — consulta actores, sus obras, recursos, ejemplares y proyectos</p>
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
              <h2 class="card-title">{{ formatActorName(actor) }}</h2>
              @if (actor.nombreReunion) {
                <span class="card-badge">Reunión</span>
              }
            </div>

            <div class="tab-bar">
              <button class="tab-btn" [class.active]="getTab(actor._id) === 'obras'" (click)="setTab(actor._id, 'obras')">
                <mat-icon class="tab-icon">library_music</mat-icon> Obras
              </button>
              <button class="tab-btn" [class.active]="getTab(actor._id) === 'recursos'" (click)="setTab(actor._id, 'recursos')">
                <mat-icon class="tab-icon">inventory_2</mat-icon> Recursos
              </button>
              <button class="tab-btn" [class.active]="getTab(actor._id) === 'proyectos'" (click)="setTab(actor._id, 'proyectos')">
                <mat-icon class="tab-icon">folder</mat-icon> Proyectos
              </button>
              <button class="tab-btn" [class.active]="getTab(actor._id) === 'roles'" (click)="setTab(actor._id, 'roles')">
                <mat-icon class="tab-icon">badge</mat-icon> Roles
              </button>
            </div>

            @if (getTab(actor._id) === 'obras') {
              <div class="card-section">
                @if (actor.obras?.length) {
                  <h3 class="section-title">Obras ({{ actor.obras.length }})</h3>
                  @for (obra of actor.obras; track obra._id) {
                    <div class="sub-card">
                      <div class="sub-card-header">
                        <a class="sub-card-title entity-link" [routerLink]="'/obras/' + obra._id">{{ obra.titulo }}</a>
                        @if (obra.rol) {
                          <span class="role-badge">{{ obra.rol }}</span>
                        }
                      </div>
                      @if (obra.recursos?.length) {
                        <div class="recursos-section">
                          @for (rec of obra.recursos; track rec._id) {
                            <div class="rec-card">
                              <div class="rec-card-header">
                                <a class="rec-card-title entity-link" [routerLink]="'/recursos/' + rec._id">
                                  <mat-icon class="ej-link-icon">link</mat-icon>{{ rec.titulo }}
                                </a>
                                @if (rec.rol) {
                                  <span class="role-badge">{{ rec.rol }}</span>
                                }
                              </div>
                              @if (rec.ejemplares?.length) {
                                <div class="ejemplares-list">
                                  @for (ej of rec.ejemplares; track ej._id) {
                                    <div class="ej-item">
                                      <a class="ej-num entity-link" [routerLink]="'/ejemplares/' + ej._id">
                                        <mat-icon class="ej-link-icon">link</mat-icon>{{ ej.numeroEjemplar || '—' }}
                                      </a>
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
                } @else {
                  <span class="no-data">No se encontraron obras para este autor</span>
                }
              </div>
            }

            @if (getTab(actor._id) === 'recursos') {
              <div class="card-section">
                @let flatRecursos = flattenRecursos(actor.obras);
                @if (flatRecursos.length) {
                  <h3 class="section-title">Todos los recursos ({{ flatRecursos.length }})</h3>
                  @for (item of flatRecursos; track item.recurso._id) {
                    <div class="sub-card">
                      <div class="sub-card-header">
                        <a class="sub-card-title entity-link" [routerLink]="'/recursos/' + item.recurso._id">{{ item.recurso.titulo }}</a>
                        @if (item.rol) {
                          <span class="role-badge">{{ item.rol }}</span>
                        }
                      </div>
                      <div class="recurso-context">
                        <mat-icon class="context-icon">subdirectory_arrow_right</mat-icon>
                        <a class="context-obra entity-link" [routerLink]="'/obras/' + item.obraId">{{ item.obraTitulo }}</a>
                      </div>
                      @if (item.recurso.ejemplares?.length) {
                        <div class="ejemplares-list" style="margin-top:0.4rem">
                          @for (ej of item.recurso.ejemplares; track ej._id) {
                            <div class="ej-item">
                              <a class="ej-num entity-link" [routerLink]="'/ejemplares/' + ej._id">
                                <mat-icon class="ej-link-icon">link</mat-icon>{{ ej.numeroEjemplar || '—' }}
                              </a>
                              <span class="ej-status" [class.disp]="ej.disponibilidad === 'Disponible'">{{ ej.disponibilidad || '—' }}</span>
                              @if (ej.fondo) { <span class="ej-loc">{{ ej.fondo.nombre }}</span> }
                              @if (ej.coleccion) { <span class="ej-loc">{{ ej.coleccion.nombre }}</span> }
                            </div>
                          }
                        </div>
                      } @else {
                        <span class="no-data" style="margin-top:0.3rem">Sin ejemplares</span>
                      }
                    </div>
                  }
                } @else {
                  <span class="no-data">No hay recursos vinculados a las obras de este autor</span>
                }
              </div>
            }

            @if (getTab(actor._id) === 'proyectos') {
              <div class="card-section">
                @if (actor.proyectos?.length) {
                  <h3 class="section-title">Proyectos ({{ actor.proyectos.length }})</h3>
                  <div class="proyectos-list">
                    @for (p of actor.proyectos; track p._id) {
                      <div class="proyecto-item">
                        <a class="proyecto-nombre entity-link" [routerLink]="'/proyectos/' + p._id">
                          <mat-icon class="ej-link-icon">link</mat-icon>{{ p.nombre }}
                        </a>
                        @if (p.descripcion) {
                          <span class="proyecto-desc">{{ p.descripcion }}</span>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <span class="no-data">No se encontraron proyectos para este autor</span>
                }
              </div>
            }

            @if (getTab(actor._id) === 'roles') {
              <div class="card-section">
                @let grupos = groupByRole(actor.obras);
                @if (grupos.length) {
                  <h3 class="section-title">Obras por rol</h3>
                  @for (g of grupos; track g.rol) {
                    <div class="role-group">
                      <h4 class="role-group-title">{{ g.rol }}</h4>
                      @for (obra of g.obras; track obra._id) {
                        <div class="sub-card" style="margin-bottom:0.35rem">
                          <div class="sub-card-header">
                            <a class="sub-card-title entity-link" [routerLink]="'/obras/' + obra._id">
                              <mat-icon class="ej-link-icon">link</mat-icon>{{ obra.titulo }}
                            </a>
                          </div>
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <span class="no-data">No hay obras con roles asignados</span>
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
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .card-title { margin: 0; font-size: 1.15rem; color: var(--simr-tinta); }
    .card-badge {
      font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
      background: #6b8e23; color: white; padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .tab-bar {
      display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--mat-sys-outline); padding-bottom: 0.25rem;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 0.2rem;
      padding: 0.35rem 0.75rem; border: none; border-radius: 6px 6px 0 0;
      background: transparent; color: var(--simr-tinta-2);
      font-size: 0.75rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .tab-btn:hover { background: var(--simr-hueso); color: var(--simr-tinta); }
    .tab-btn.active {
      background: var(--simr-hueso); color: var(--simr-tinta);
      box-shadow: inset 0 -2px 0 var(--simr-cobre);
    }
    .tab-icon { font-size: 16px; width: 16px; height: 16px; }

    .card-section { }
    .section-title { font-size: 0.78rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--simr-tinta); }

    .sub-card {
      background: var(--simr-hueso); border-radius: 10px;
      padding: 0.75rem 1rem; margin-bottom: 0.5rem;
    }
    .sub-card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap; }
    .sub-card-title { font-size: 0.85rem; font-weight: 600; color: var(--simr-tinta); }
    .role-badge {
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      background: #9b8c6e; color: white; padding: 0.1rem 0.45rem; border-radius: 3px;
      white-space: nowrap;
    }

    .recursos-section { margin-top: 0.4rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .rec-card {
      background: var(--simr-papel); border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .rec-card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
    .rec-card-title { font-size: 0.8rem; font-weight: 600; color: var(--simr-tinta); }

    .ejemplares-list { display: flex; flex-direction: column; gap: 0.15rem; }
    .ej-item {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; padding: 0.1rem 0;
    }
    .ej-num { font-family: 'IBM Plex Mono', monospace; color: var(--simr-tinta-2); min-width: 90px; }
    .ej-status { font-weight: 600; color: var(--simr-tinta-2); }
    .ej-status.disp { color: #2e7d32; }
    .ej-loc { color: var(--simr-tinta-2); }
    .ej-loc::before { content: '·'; margin: 0 0.35rem; }
    .ej-link-icon { font-size: 12px; width: 12px; height: 12px; vertical-align: middle; margin-right: 2px; }
    .entity-link { color: var(--simr-cobre); text-decoration: none; cursor: pointer; }
    .entity-link:hover { text-decoration: underline; }

    .recurso-context {
      display: flex; align-items: center; gap: 0.3rem; font-size: 0.72rem;
      color: var(--simr-tinta-2); margin-bottom: 0.2rem;
    }
    .context-icon { font-size: 14px; width: 14px; height: 14px; }
    .context-obra { font-style: italic; }

    .proyectos-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .proyecto-item {
      background: var(--simr-hueso); border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .proyecto-nombre { font-size: 0.82rem; font-weight: 600; display: block; }
    .proyecto-desc { font-size: 0.75rem; color: var(--simr-tinta-2); display: block; margin-top: 0.15rem; }

    .role-group { margin-bottom: 0.75rem; }
    .role-group:last-child { margin-bottom: 0; }
    .role-group-title {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--simr-tinta-2); margin: 0 0 0.35rem; padding: 0.2rem 0.5rem;
      background: var(--simr-hueso); border-radius: 4px; display: inline-block;
    }

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
  activeTabs = signal<Record<string, string>>({});

  setTab(actorId: string, tab: string) {
    this.activeTabs.update(t => ({ ...t, [actorId]: tab }));
  }

  getTab(actorId: string): string {
    return this.activeTabs()[actorId] || 'obras';
  }

  groupByRole(obras: OpacActor['obras']): { rol: string; obras: OpacActor['obras'] }[] {
    const map = new Map<string, OpacActor['obras']>();
    for (const o of obras) {
      const key = o.rol || 'Otros';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return [...map.entries()].map(([rol, obras]) => ({ rol, obras }));
  }

  flattenRecursos(obras: OpacActor['obras']): { recurso: OpacActor['obras'][0]['recursos'][0]; obraTitulo: string; obraId: string; rol: string }[] {
    const seen = new Set<string>();
    const result: { recurso: OpacActor['obras'][0]['recursos'][0]; obraTitulo: string; obraId: string; rol: string }[] = [];
    for (const o of obras) {
      for (const r of o.recursos || []) {
        if (!seen.has(r._id)) {
          seen.add(r._id);
          result.push({ recurso: r, obraTitulo: o.titulo, obraId: o._id, rol: o.rol || '' });
        }
      }
    }
    return result;
  }

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
