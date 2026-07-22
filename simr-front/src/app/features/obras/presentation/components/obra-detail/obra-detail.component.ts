import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { ObrasStore } from '../../../data/obras.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
  ],
  providers: [ObrasStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedObra(); as o) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(o._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(o._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles de la obra…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedObra(); as o) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>library_music</mat-icon>
              <h1>{{ o.titulo }}</h1>
            </div>
            <span class="simr-codigo">ID {{ o._id }}</span>
          </div>

          @if (o.tituloOriginal) {
            <app-collapsible-section title="Título original" icon="title">
              <p class="desc-text">{{ o.tituloOriginal }}</p>
            </app-collapsible-section>
          }

          @if (o.descripcion) {
            <app-collapsible-section title="Descripción" icon="description">
              <p class="desc-text">{{ o.descripcion }}</p>
            </app-collapsible-section>
          }

          @if (o.tipoDeObra && o.tipoDeObra.length > 0) {
            <app-collapsible-section title="Tipos de obra" icon="category">
              <div class="chips-wrapper">
                @for (t of o.tipoDeObra; track $index) {
                  <span class="detalle-chip">{{ t }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.ambitoGeografico && o.ambitoGeografico.length > 0) {
            <app-collapsible-section title="Ámbitos geográficos" icon="public">
              <div class="chips-wrapper">
                @for (a of o.ambitoGeografico; track $index) {
                  <span class="detalle-chip">{{ a }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.lugarDeEjecucion || o.anyoEstreno || o.duracion || o.estado) {
            <app-collapsible-section title="Información de ejecución" icon="info">
              <div class="info-grid">
                @if (o.lugarDeEjecucion) {
                  <div class="info-item">
                    <label>Lugar de ejecución</label>
                    <span>{{ o.lugarDeEjecucion }}</span>
                  </div>
                }
                @if (o.anyoEstreno) {
                  <div class="info-item">
                    <label>Año de estreno</label>
                    <span>{{ o.anyoEstreno }}</span>
                  </div>
                }
                @if (o.duracion) {
                  <div class="info-item">
                    <label>Duración</label>
                    <span>{{ o.duracion }}</span>
                  </div>
                }
                @if (o.estado) {
                  <div class="info-item">
                    <label>Estado</label>
                    <span>{{ o.estado }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.contextos && o.contextos.length > 0) {
            <app-collapsible-section title="Contextos" icon="description">
              <div class="kv-list">
                @for (c of o.contextos; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ c.contexto }}</span>
                    <span class="kv-value">{{ c.descripcion }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.obrasVinculadas && o.obrasVinculadas.length > 0) {
            <app-collapsible-section title="Obras vinculadas" icon="link">
              <div class="kv-list">
                @for (ov of o.obrasVinculadas; track $index) {
                  <div class="kv-item clickable" (click)="navigateToObra(getObraRef(ov))">
                    <span class="kv-value">{{ getObraTitulo(ov) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.recursosVinculados && o.recursosVinculados.length > 0) {
            <app-collapsible-section title="Recursos vinculados" icon="inventory">
              <div class="kv-list">
                @for (rv of o.recursosVinculados; track $index) {
                  <div class="kv-item clickable" (click)="navigateToRecurso(getRecursoRef(rv))">
                    <span class="kv-value">{{ getRecursoTitulo(rv) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.actores && o.actores.length > 0) {
            <app-collapsible-section title="Actores" icon="people">
              <div class="kv-list">
                @for (a of o.actores; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getActorNombre(a.actor) }}</span>
                    <span class="kv-value">{{ a.rol }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.proyectos && o.proyectos.length > 0) {
            <app-collapsible-section title="Proyectos asociados" icon="folder">
              <div class="kv-list">
                @for (p of o.proyectos; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getProyNombre(p) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.generos && o.generos.length > 0) {
            <app-collapsible-section title="Géneros" icon="music_note">
              <div class="kv-list">
                @for (g of o.generos; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getGenNombre(g) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.instrumentos && o.instrumentos.length > 0) {
            <app-collapsible-section title="Instrumentos" icon="straighten">
              <div class="kv-list">
                @for (i of o.instrumentos; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getInstNombre(i) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.notasPrograma && o.notasPrograma.length > 0) {
            <app-collapsible-section title="Notas de programa" icon="notes">
              <div class="kv-list">
                @for (n of o.notasPrograma; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ n.titulo }}</span>
                    <span class="kv-value">{{ n.contenido }} @if (n.fecha) { — {{ n.fecha | date:'dd/MM/yyyy' }} }</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.fechasAsociadas && o.fechasAsociadas.length > 0) {
            <app-collapsible-section title="Fechas asociadas" icon="event">
              <div class="kv-list">
                @for (f of o.fechasAsociadas; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ f.tipo || 'Fecha' }}</span>
                    <span class="kv-value">{{ f.fecha | date:'dd/MM/yyyy' }} @if (f.descripcion) { — {{ f.descripcion }} }</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.anotaciones && o.anotaciones.length > 0) {
            <app-collapsible-section title="Anotaciones" icon="comment">
              <div class="kv-list">
                @for (a of o.anotaciones; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ a.titulo }}</span>
                    <span class="kv-value">{{ a.anotacion }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.descriptores && o.descriptores.length > 0) {
            <app-collapsible-section title="Descriptores" icon="label">
              <div class="chips-wrapper">
                @for (d of o.descriptores; track $index) {
                  <span class="detalle-chip">{{ d }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.enlaces && o.enlaces.length > 0) {
            <app-collapsible-section title="Enlaces" icon="language">
              <div class="kv-list">
                @for (e of o.enlaces; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ e.descripcion || 'Enlace' }}</span>
                    <a class="kv-value kv-link" [href]="e.url" target="_blank" rel="noopener">{{ e.url }}</a>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <app-archivo-manager
              collection="obras"
              [documentId]="o._id"
              [readonly]="true"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(o.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ o.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Obra no encontrada.</p>
            <button mat-stroked-button routerLink="/obras">Volver al listado</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .volver { color: var(--simr-musgo); }
    .header-actions { display: flex; gap: 0.75rem; }
    .cargando { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .ficha { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { background: var(--simr-tinta); color: var(--simr-hueso); padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .titulo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--simr-cobre); }
    .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 2rem; color: var(--simr-hueso); }
    .ficha-cabecera .simr-codigo { color: rgba(251, 249, 244, 0.7); }
    .desc-text { padding: 0.5rem 0; line-height: 1.6; color: var(--simr-tinta-2); }
    .chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .detalle-chip { background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
    .kv-item.clickable { cursor: pointer; transition: border-color 0.2s; }
    .kv-item.clickable:hover { border-color: var(--simr-cobre); }
    .kv-key { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 120px; padding: 0.15rem 0.5rem; background: var(--simr-hueso); border-radius: 4px; text-align: center; }
    .kv-value { flex: 1; font-size: 0.9rem; color: var(--simr-tinta-2); }
    .kv-link { color: var(--simr-musgo); text-decoration: none; }
    .kv-link:hover { text-decoration: underline; color: var(--simr-cobre); }
    .seccion { padding: 1.5rem 2rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .seccion:last-child { border-bottom: none; }
    .seccion h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-family: var(--simr-body); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--simr-sello); }
    .seccion h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--simr-sello); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
  `],
})
export class ObraDetailComponent implements OnInit {
  protected readonly store = inject(ObrasStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected obraId: string | null = null;
  private obrasCache: any[] = [];
  private recursosCache: any[] = [];
  private actoresCache: any[] = [];
  private proyectosCache: any[] = [];
  private generosCache: any[] = [];
  private instrumentosCache: any[] = [];

  protected readonly obra = this.store.selectedObra;

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/obras`).subscribe({
      next: (res) => this.obrasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.obrasCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/recursos`).subscribe({
      next: (res) => this.recursosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.recursosCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/actores`).subscribe({
      next: (res) => this.actoresCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.actoresCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/proyectos`).subscribe({
      next: (res) => this.proyectosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.proyectosCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/generos`).subscribe({
      next: (res) => this.generosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.generosCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/instrumentos`).subscribe({
      next: (res) => this.instrumentosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.instrumentosCache = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.obraId = id;
        this.store.setInitialState();
        this.store.loadById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  protected getObraRef(item: any): string {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id || item._id || '';
  }

  protected getObraTitulo(item: any): string {
    if (!item) return '';
    if (typeof item === 'object' && item.titulo) return item.titulo;
    const ref = this.getObraRef(item);
    const found = this.obrasCache.find((o) => o._id === ref);
    return found?.titulo || '(cargando…)';
  }

  protected getRecursoRef(item: any): string {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id || item._id || '';
  }

  protected getRecursoTitulo(item: any): string {
    if (!item) return '';
    if (typeof item === 'object' && item.titulo) return item.titulo;
    const ref = this.getRecursoRef(item);
    const found = this.recursosCache.find((r) => r._id === ref);
    return found?.titulo || '(cargando…)';
  }

  protected getActorNombre(actor: any): string {
    if (!actor) return '';
    if (typeof actor === 'object' && actor.fullName) return actor.fullName;
    if (typeof actor === 'object' && actor.nombre) return actor.nombre;
    if (typeof actor === 'object' && actor._id) {
      const found = this.actoresCache.find((a) => a._id === actor._id);
      return found?.fullName || found?.nombre || '(cargando…)';
    }
    const found = this.actoresCache.find((a) => a._id === actor);
    return found?.fullName || found?.nombre || '(cargando…)';
  }

  protected getProyNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const found = this.proyectosCache.find((p) => p._id === ref);
    return found?.nombre || '(cargando…)';
  }

  protected getGenNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const found = this.generosCache.find((g) => g._id === ref);
    return found?.nombre || '(cargando…)';
  }

  protected getInstNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const found = this.instrumentosCache.find((i) => i._id === ref);
    return found?.nombre || '(cargando…)';
  }

  protected navigateToObra(id: string) {
    if (!id) return;
    this.router.navigate(['/obras', id]);
  }

  protected navigateToRecurso(id: string) {
    if (!id) return;
    this.router.navigate(['/recursos', id]);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/obras/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedObra()?.titulo || 'esta obra';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar obra', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.delete(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/obras']);
  }
}
