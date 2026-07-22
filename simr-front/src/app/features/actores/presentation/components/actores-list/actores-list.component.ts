import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActoresStore } from '../../../data/actores.store';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-actores-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatDialogModule, MatTooltipModule,
  ],
  providers: [ActoresStore],
  template: `
    <div class="list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Actores</p>
          <h1>Actores</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nuevo Actor
        </a>
      </header>

      @if (store.isLoading()) {
        <mat-progress-bar mode="indeterminate" class="barra"></mat-progress-bar>
      }

      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }

      @if (store.hasActores() && !store.isLoading()) {
        <div class="grid">
          @for (a of store.actores(); track a._id) {
            <mat-card class="card" appearance="outlined" (click)="navigateToDetail(a._id)">
              <mat-card-header>
                <mat-card-title>{{ a.fullName || a.nombres + ' ' + a.apellidos }}</mat-card-title>
                <span class="simr-codigo">ID {{ a._id.slice(-6) }}</span>
              </mat-card-header>
              <mat-card-content>
                @if (a.contenedor?.length) {
                  <div class="meta-row">
                    <mat-icon>link</mat-icon>
                    <span>{{ a.contenedor.length }} contenedor(es)</span>
                  </div>
                }
                @if (a.vinculoRelacionado?.length) {
                  <div class="meta-row">
                    <mat-icon>language</mat-icon>
                    <span>{{ a.vinculoRelacionado.length }} vínculo(s)</span>
                  </div>
                }
                @if (a.archivosAdjuntos?.length) {
                  <div class="meta-row">
                    <mat-icon>attach_file</mat-icon>
                    <span>{{ a.archivosAdjuntos.length }} archivo(s)</span>
                  </div>
                }
                @if (a.creador) {
                  <div class="meta-row">
                    <mat-icon>person</mat-icon>
                    <span>{{ a.creador.fullName || a.creador.firstName + ' ' + a.creador.lastName }}</span>
                  </div>
                }
                @if (a.creado) {
                  <div class="meta-row">
                    <mat-icon>calendar_today</mat-icon>
                    <span>{{ a.creado | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(a._id)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(a._id)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }

      @if (!store.hasActores() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>person_outline</mat-icon>
          <h3>No hay actores registrados</h3>
          <p>Aún no se ha registrado ningún actor en el archivo.</p>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Actor
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .header h1 { margin: 0.2em 0 0; }
    .barra { margin-bottom: 1rem; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31,42,36,0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    mat-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .simr-codigo { color: var(--simr-tinta-2); font-size: 0.75rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); padding: 0.25rem 0; }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; margin-bottom: 0.5rem; }
  `],
})
export class ActoresListComponent implements OnInit {
  protected readonly store = inject(ActoresStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.store.setInitialState();
    this.store.loadAll();
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/actores', id]);
  }

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/actores', id, 'edit']);
  }

  confirmDelete(id: string) {
    const actor = this.store.actores().find((a) => a._id === id);
    const name = actor?.fullName || actor?.nombres || 'este actor';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar actor', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.delete(id);
    });
  }
}
