import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ActoresStore } from '../../../data/actores.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { formatActorName } from '../../../models/actor.interface';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
  ],
  providers: [ActoresStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedActor(); as a) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(a._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(a._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del actor…</span>
        </div>
      }

      @if (store.selectedActor(); as a) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>person</mat-icon>
              <h1>{{ formatActorName(a) }}</h1>
            </div>
            <span class="simr-codigo">ID {{ a._id }}</span>
          </div>

          <app-collapsible-section title="Nombres" icon="badge">
            <div class="kv-list">
              @if (a.nombres) {
                <div class="kv-item"><span class="kv-key">Nombres</span><span class="kv-value">{{ a.nombres }}</span></div>
              }
              @if (a.apellidos) {
                <div class="kv-item"><span class="kv-key">Apellidos</span><span class="kv-value">{{ a.apellidos }}</span></div>
              }
              @if (a.nombreArtistico) {
                <div class="kv-item"><span class="kv-key">Nombre artístico</span><span class="kv-value">{{ a.nombreArtistico }}</span></div>
              }
              @if (a.nombreReunion) {
                <div class="kv-item"><span class="kv-key">Nombre de reunión</span><span class="kv-value">{{ a.nombreReunion }}</span></div>
              }
            </div>
          </app-collapsible-section>

          @if (a.contenedor && a.contenedor.length > 0) {
            <app-collapsible-section title="Contenedores (actores asociados)" icon="link">
              <div class="kv-list">
                @for (c of a.contenedor; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getContenedorName(c) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (a.anotacionCartograficoTemporal && a.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico-temporales" icon="map">
              <div class="kv-list">
                @for (ct of a.anotacionCartograficoTemporal; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ ct.evento || 'Evento' }}</span>
                    <span class="kv-value">{{ ct.fechaInicio || '?' }} – {{ ct.fechaFin || '?' }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (a.descriptores && a.descriptores.length > 0) {
            <app-collapsible-section title="Descriptores" icon="label">
              <div class="kv-list">
                @for (d of a.descriptores; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (a.vinculoRelacionado && a.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of a.vinculoRelacionado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ v.etiqueta || 'Vínculo' }}</span>
                    <a class="kv-value kv-link" [href]="v.url" target="_blank" rel="noopener">{{ v.url }}</a>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <app-archivo-manager
              collection="actores"
              [documentId]="a._id"
              [readonly]="true"
            />
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(a.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ a.creado | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Actor no encontrado.</p>
            <button mat-stroked-button routerLink="/actores">Volver al listado</button>
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
    .ficha { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { background: var(--simr-tinta); color: var(--simr-hueso); padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .titulo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--simr-cobre); }
    .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 2rem; color: var(--simr-hueso); }
    .ficha-cabecera .simr-codigo { color: rgba(251,249,244,0.7); }
    .desc-text { padding: 0.5rem 0; line-height: 1.6; color: var(--simr-tinta-2); }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
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
export class ActorDetailComponent implements OnInit {
  protected readonly store = inject(ActoresStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected formatActorName = formatActorName;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.store.setInitialState();
        this.store.loadById(id);
      }
    });
  }

  protected getContenedorName(c: any): string {
    if (!c) return '';
    if (typeof c.id === 'object' && (c.id?.nombres || c.id?.nombreArtistico || c.id?.nombreReunion)) {
      return formatActorName(c.id);
    }
    if (typeof c.id === 'object' && c.id?.fullName) return c.id.fullName;
    if (typeof c.id === 'string') return c.id;
    return '(referencia)';
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/actores', id, 'edit']);
  }

  confirmDelete(id: string) {
    const name = formatActorName(this.store.selectedActor()) || 'este actor';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar actor', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.delete(id);
        setTimeout(() => {
          if (!this.store.hasError()) this.goBack();
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/actores']);
  }
}
