import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DiccionariosStore } from '../../../state/diccionarios.store';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-diccionario-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  providers: [DiccionariosStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedDiccionario(); as d) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(d._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(d._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedDiccionario(); as d) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>menu_book</mat-icon>
              <h1>{{ d.tabla }} · {{ d.campo }}</h1>
            </div>
            <span class="simr-codigo">ID {{ d._id }}</span>
          </div>

          <section class="seccion">
            <h3><mat-icon>table_chart</mat-icon> Información del campo</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Tabla</label>
                <span>{{ d.tabla }}</span>
              </div>
              <div class="info-item">
                <label>Campo</label>
                <span>{{ d.campo }}</span>
              </div>
              <div class="info-item">
                <label>Nombre largo</label>
                <span>{{ d.campoLargo || '—' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Definición</label>
                <span>{{ d.definicion }}</span>
              </div>
            </div>
          </section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(d.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ d.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Entrada no encontrada.</p>
            <button mat-stroked-button routerLink="/diccionarios">Volver al listado</button>
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
    .seccion { padding: 1.5rem 2rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .seccion:last-child { border-bottom: none; }
    .seccion h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-family: var(--simr-body); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--simr-sello); }
    .seccion h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--simr-sello); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item.full-width { grid-column: 1 / -1; }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
  `],
})
export class DiccionarioDetailComponent implements OnInit {
  protected readonly store = inject(DiccionariosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.store.setInitialState();
        this.store.loadDiccionarioById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/diccionarios/edit', id]);
  }

  confirmDelete(id: string) {
    const d = this.store.selectedDiccionario();
    const name = d ? `${d.tabla} · ${d.campo}` : 'esta entrada';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar entrada',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.deleteDiccionario(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/diccionarios']);
  }
}
