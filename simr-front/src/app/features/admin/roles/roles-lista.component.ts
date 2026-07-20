import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { RolesService } from './roles.service';
import { Role } from '@core/models/user.model';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { RoleDetailDialogComponent } from '@shared/role-detail-dialog/role-detail-dialog.component';

@Component({
  selector: 'app-roles-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <div>
          <h1 class="admin-title">Roles</h1>
          <p class="simr-eyebrow">Permisos y jerarquía del sistema</p>
        </div>
        <button mat-flat-button color="primary" routerLink="crear">
          <mat-icon>add</mat-icon> Crear rol
        </button>
      </header>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
      <div *ngIf="error" class="admin-error">{{ error }}</div>

      <mat-card appearance="outlined" *ngIf="!loading && !error">
        <table mat-table [dataSource]="roles" class="admin-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let r">{{ r.name }}</td>
          </ng-container>
          <ng-container matColumnDef="displayName">
            <th mat-header-cell *matHeaderCellDef>Visualización</th>
            <td mat-cell *matCellDef="let r">{{ r.displayName }}</td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Prioridad</th>
            <td mat-cell *matCellDef="let r"><span class="badge">{{ r.priority }}</span></td>
          </ng-container>
          <ng-container matColumnDef="sistema">
            <th mat-header-cell *matHeaderCellDef>Sistema</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [class.sistema]="r.isSystem">{{ r.isSystem ? 'Sistema' : 'Personalizado' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button (click)="ver(r)" aria-label="Ver detalles">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="r.id + '/editar'" aria-label="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="eliminar(r)" [disabled]="r.isSystem" aria-label="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>
        <p class="empty" *ngIf="roles.length === 0">No hay roles registrados.</p>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 1000px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.9rem; margin: 0; }
      .simr-eyebrow { font-family: var(--simr-body); font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--simr-tinta); opacity: 0.6; margin: 6px 0 0; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
      .admin-error { color: var(--simr-sello); font-family: var(--simr-body); padding: 14px; }
      .admin-table { width: 100%; background: var(--simr-hueso); }
      .badge { font-family: var(--simr-mono); font-size: 0.74rem; background: rgba(31,42,36,0.1); border-radius: 10px; padding: 1px 8px; }
      .badge.sistema { background: rgba(181,67,42,0.18); color: var(--simr-sello); }
      .empty { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.6; padding: 14px; }
    `,
  ],
})
export class RolesListaComponent implements OnInit {
  roles: Role[] = [];
  columnas = ['name', 'displayName', 'priority', 'sistema', 'acciones'];
  loading = false;
  error = '';

  constructor(
    private rolesService: RolesService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.rolesService.getAll(true).subscribe({
      next: (data) =>
        (this.roles = data.sort((a, b) => (b.priority || 0) - (a.priority || 0))),
      error: (err) => (this.error = err),
      complete: () => (this.loading = false),
    });
  }

  ver(r: Role): void {
    this.dialog.open(RoleDetailDialogComponent, {
      data: { id: r.id || (r as any)._id, nombre: r.displayName || r.name },
      width: '560px',
    });
  }

  eliminar(r: Role): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar rol',
        message: `¿Confirma eliminar el rol "${r.name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok || !r.id) {
        return;
      }
      this.rolesService.remove(r.id).subscribe({
        next: () => {
          this.snack.open('Rol eliminado.', 'Cerrar', { duration: 2500 });
          this.load();
        },
        error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
      });
    });
  }
}
