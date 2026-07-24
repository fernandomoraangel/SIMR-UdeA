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
import { RecursosStore } from '../../../state/recursos.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';

@Component({
  selector: 'app-recurso-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
    AnotacionesCartograficasComponent,
  ],
  providers: [RecursosStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedRecurso(); as r) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(r._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(r._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del recurso…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedRecurso(); as r) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>inventory</mat-icon>
              <h1>{{ r.titulo }}</h1>
            </div>
            <span class="simr-codigo">ID {{ r._id }}</span>
          </div>

          @if (r.descripcion) {
            <app-collapsible-section title="Descripción" icon="description">
              <p class="desc-text">{{ r.descripcion }}</p>
            </app-collapsible-section>
          }

          @if (r.obrasRelacionadas && r.obrasRelacionadas.length > 0) {
            <app-collapsible-section title="Obras relacionadas" icon="library_music">
              <div class="kv-list">
                @for (o of r.obrasRelacionadas; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getObraNombre(o.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.numeroNormalizado && r.numeroNormalizado.length > 0) {
            <app-collapsible-section title="Números normalizados" icon="tag">
              <div class="kv-list">
                @for (n of r.numeroNormalizado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ n.nombre }}</span>
                    <span class="kv-value">{{ n.numero }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.faceta) {
            <app-collapsible-section title="Faceta" icon="face">
              <p class="desc-text">{{ r.faceta }}</p>
            </app-collapsible-section>
          }

          @if (r.mencionResponsabilidad && r.mencionResponsabilidad.length > 0) {
            <app-collapsible-section title="Menciones de responsabilidad" icon="people">
              <div class="kv-list">
                @for (m of r.mencionResponsabilidad; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getActorNombre(m.actor) }}</span>
                    <span class="kv-value">{{ m.tipoDeMencion }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.contenedores && r.contenedores.length > 0) {
            <app-collapsible-section title="Contenedores" icon="folder_open">
              <div class="kv-list">
                @for (c of r.contenedores; track $index) {
                  <div class="kv-item clickable" (click)="navigateToRecurso(c.id)">
                    <span class="kv-value">{{ getRecursoNombre(c.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.fuente && r.fuente.length > 0) {
            <app-collapsible-section title="Fuentes" icon="source">
              <div class="kv-list">
                @for (f of r.fuente; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ f.tipoFuente }}</span>
                    <span class="kv-value">{{ f.nombre }}{{ f.lugar ? ' — ' + f.lugar : '' }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.tiposDeRecurso && r.tiposDeRecurso.length > 0) {
            <app-collapsible-section title="Tipos de recurso" icon="category">
              <div class="kv-list">
                @for (t of r.tiposDeRecurso; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ t.id }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.anotacionCartograficoTemporal && r.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map">
              <app-anotaciones-cartograficas
                [anotaciones]="r.anotacionCartograficoTemporal"
                [lugares]="[]"
                [coberturas]="[]"
                [readonly]="true"
              />
            </app-collapsible-section>
          }

          @if (r.materia && r.materia.length > 0) {
            <app-collapsible-section title="Materias" icon="book">
              <div class="kv-list">
                @for (m of r.materia; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getMateriaNombre(m.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.idiomas && r.idiomas.length > 0) {
            <app-collapsible-section title="Idiomas" icon="language">
              <div class="kv-list">
                @for (i of r.idiomas; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getIdiomaNombre(i.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.descripcionTecnica && r.descripcionTecnica.length > 0) {
            <app-collapsible-section title="Descripción técnica" icon="settings">
              <div class="kv-list">
                @for (d of r.descripcionTecnica; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.criterio }}</span>
                    <span class="kv-value">{{ d.valor }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.materialAcompanante) {
            <app-collapsible-section title="Material acompañante" icon="inventory_2">
              <p class="desc-text">{{ r.materialAcompanante }}</p>
            </app-collapsible-section>
          }

          @if (r.mencionDeSerie) {
            <app-collapsible-section title="Mención de serie" icon="collections_bookmark">
              <p class="desc-text">{{ r.mencionDeSerie }}</p>
            </app-collapsible-section>
          }

          @if (r.proyectos && r.proyectos.length > 0) {
            <app-collapsible-section title="Proyectos asociados" icon="assignment">
              <div class="kv-list">
                @for (p of r.proyectos; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getProyNombre(p.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.descriptorLibre && r.descriptorLibre.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label">
              <div class="kv-list">
                @for (d of r.descriptorLibre; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (r.vinculoRelacionado && r.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of r.vinculoRelacionado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ v.etiqueta }}</span>
                    <a class="kv-value kv-link" [href]="v.url" target="_blank" rel="noopener">{{ v.url }}</a>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <app-archivo-manager
              collection="recursos"
              [documentId]="r._id"
              [readonly]="true"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(r.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ r.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Recurso no encontrado.</p>
            <button mat-stroked-button routerLink="/recursos">Volver al listado</button>
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
export class RecursoDetailComponent implements OnInit {
  protected readonly store = inject(RecursosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected recursoId: string | null = null;
  private obrasCache: any[] = [];
  private recursosCache: any[] = [];
  private materiasCache: any[] = [];
  private idiomasCache: any[] = [];
  private proyectosCache: any[] = [];
  private actoresCache: any[] = [];

  protected readonly recurso = this.store.selectedRecurso;

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/obras`).subscribe({
      next: (res) => this.obrasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.obrasCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/recursos`).subscribe({
      next: (res) => this.recursosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.recursosCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/materias`).subscribe({
      next: (res) => this.materiasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.materiasCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/idiomas`).subscribe({
      next: (res) => this.idiomasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.idiomasCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/proyectos`).subscribe({
      next: (res) => this.proyectosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.proyectosCache = [],
    });
    this.http.get<any>(`${environment.apiUrl}/actores`).subscribe({
      next: (res) => this.actoresCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.actoresCache = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.recursoId = id;
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

  protected getObraNombre(ref: string): string {
    if (!ref) return '';
    const found = this.obrasCache.find((o) => o._id === ref);
    return found?.nombre || found?.titulo || '(cargando…)';
  }

  protected getRecursoNombre(ref: string): string {
    if (!ref) return '';
    const found = this.recursosCache.find((r) => r._id === ref);
    return found?.titulo || '(cargando…)';
  }

  protected getMateriaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.materiasCache.find((m) => m._id === ref);
    return found?.nombre || '(cargando…)';
  }

  protected getIdiomaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.idiomasCache.find((i) => i._id === ref);
    return found?.idioma || found?.nombre || '(cargando…)';
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

  protected getActorNombre(actor: any): string {
    if (!actor) return '';
    if (typeof actor === 'object' && (actor.nombres || actor.apellidos)) {
      return [actor.nombres, actor.apellidos].filter(Boolean).join(' ');
    }
    if (typeof actor === 'object' && actor.nombre) return actor.nombre;
    if (typeof actor === 'object' && actor._id) {
      const found = this.actoresCache.find((a) => a._id === actor._id);
      if (found) return [found.nombres, found.apellidos].filter(Boolean).join(' ') || '(cargando…)';
      return '(cargando…)';
    }
    const found = this.actoresCache.find((a) => a._id === actor);
    if (found) return [found.nombres, found.apellidos].filter(Boolean).join(' ') || '(cargando…)';
    return '(cargando…)';
  }

  protected navigateToRecurso(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/recursos', id]);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/recursos/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedRecurso()?.titulo || 'este recurso';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar recurso', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
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
    this.router.navigate(['/recursos']);
  }
}
