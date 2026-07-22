import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ColeccionesStore } from '../../../state/colecciones.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-coleccion-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CollapsibleSectionComponent,
  ],
  providers: [ColeccionesStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedColeccion(); as c) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(c._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(c._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles de la colección…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedColeccion(); as c) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>collections_bookmark</mat-icon>
              <h1>{{ c.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ c._id }}</span>
          </div>

          @if (c.tipo) {
            <app-collapsible-section title="Tipo" icon="category">
              <p class="valor">{{ c.tipo }}</p>
            </app-collapsible-section>
          }

          @if (c.fechaDeCreacion) {
            <app-collapsible-section title="Fecha de creación" icon="calendar_today">
              <p class="valor">{{ formatFechaConPrecision(c.fechaDeCreacion, c.precision) }}</p>
            </app-collapsible-section>
          }

          @if (c.propiedadComodato) {
            <app-collapsible-section title="Propiedad / Comodato" icon="description">
              <p class="valor">{{ c.propiedadComodato }}</p>
            </app-collapsible-section>
          }

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(c.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ c.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Colección no encontrada.</p>
            <button mat-stroked-button routerLink="/colecciones">Volver al listado</button>
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
    .valor { font-size: 1rem; color: var(--simr-tinta); margin: 0; }
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
export class ColeccionDetailComponent implements OnInit {
  protected readonly store = inject(ColeccionesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected coleccionId: string | null = null;

  protected readonly coleccion = this.store.selectedColeccion;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.coleccionId = id;
        this.store.setInitialState();
        this.store.loadColeccionById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  protected formatFechaConPrecision(fecha: string | Date | null | undefined, precision: string | null | undefined): string {
    if (!fecha) return '—';
    const dateStr = typeof fecha === 'object' ? fecha.toISOString().split('T')[0] : fecha;
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return String(fecha);
    const y = d.getFullYear();
    const m = d.getMonth();
    const p = precision || 'AMD';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (p === 'A') return String(y);
    if (p === 'AM') return `${meses[m]} de ${y}`;
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/colecciones/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedColeccion()?.nombre || 'esta colección';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar colección',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.deleteColeccion(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/colecciones']);
  }
}
