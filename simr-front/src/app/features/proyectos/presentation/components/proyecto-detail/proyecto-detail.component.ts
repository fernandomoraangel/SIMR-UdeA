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
import { ProyectosStore } from '../../../state/proyectos.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-proyecto-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
  ],
  providers: [ProyectosStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedProyecto(); as p) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(p._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(p._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del proyecto…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedProyecto(); as p) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>folder</mat-icon>
              <h1>{{ p.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ p._id }}</span>
          </div>

          @if (p.estado) {
            <app-collapsible-section title="Estado" icon="flag">
              <p class="desc-text">{{ p.estado }}</p>
            </app-collapsible-section>
          }

          @if (p.investigadores && p.investigadores.length > 0) {
            <app-collapsible-section title="Investigadores" icon="people">
              <div class="kv-list">
                @for (inv of p.investigadores; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getActorNombre(inv.id) }}</span>
                    <span class="kv-value">{{ inv.rol }}</span>
                    @if (inv.activoDesde) {
                      <span class="kv-value">{{ inv.activoDesde | date:'dd/MM/yyyy' }}{{ inv.precisionActivoDesde ? ' (' + inv.precisionActivoDesde + ')' : '' }}</span>
                    }
                    @if (inv.activoHasta) {
                      <span class="kv-value">→ {{ inv.activoHasta | date:'dd/MM/yyyy' }}{{ inv.precisionActivoHasta ? ' (' + inv.precisionActivoHasta + ')' : '' }}</span>
                    }
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (p.fechasAsociadas && p.fechasAsociadas.length > 0) {
            <app-collapsible-section title="Fechas asociadas" icon="event">
              <div class="kv-list">
                @for (f of p.fechasAsociadas; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ f.fecha | date:'dd/MM/yyyy' }}</span>
                    <span class="kv-value">{{ f.evento }}</span>
                    @if (f.precision) {
                      <span class="kv-value">{{ f.precision }}</span>
                    }
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (p.descriptoresLibres && p.descriptoresLibres.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label">
              <div class="kv-list">
                @for (d of p.descriptoresLibres; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (p.vinculoRelacionado && p.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of p.vinculoRelacionado; track $index) {
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
              collection="proyectos"
              [documentId]="p._id"
              [readonly]="true"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(p.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ p.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Proyecto no encontrado.</p>
            <button mat-stroked-button routerLink="/proyectos">Volver al listado</button>
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
export class ProyectoDetailComponent implements OnInit {
  protected readonly store = inject(ProyectosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected proyectoId: string | null = null;
  private actoresCache: any[] = [];

  protected readonly proyecto = this.store.selectedProyecto;

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/actores?select=nombre`).subscribe({
      next: (res) => this.actoresCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.actoresCache = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.proyectoId = id;
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

  protected getActorNombre(ref: string): string {
    if (!ref) return '';
    const found = this.actoresCache.find((a) => a._id === ref);
    return found?.nombre || '(cargando…)';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/proyectos/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedProyecto()?.nombre || 'este proyecto';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar proyecto', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
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
    this.router.navigate(['/proyectos']);
  }
}
