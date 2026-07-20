import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UsersService } from './users.service';
import { User } from '@core/models/user.model';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { UserDetailDialogComponent } from '@shared/user-detail-dialog/user-detail-dialog.component';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <div>
          <h1 class="admin-title">Usuarios</h1>
          <p class="simr-eyebrow">Gestión de cuentas del sistema</p>
        </div>
        <button mat-flat-button color="primary" routerLink="crear">
          <mat-icon>add</mat-icon> Crear usuario
        </button>
      </header>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
      <div *ngIf="error" class="admin-error">{{ error }}</div>

      <mat-card appearance="outlined" *ngIf="!loading && !error">
        <table mat-table [dataSource]="usuarios" class="admin-table">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Usuario</th>
            <td mat-cell *matCellDef="let u">{{ u.username }}</td>
          </ng-container>
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Correo</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>
          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Roles</th>
            <td mat-cell *matCellDef="let u">
              <span class="chip" *ngFor="let r of roleNames(u)">{{ r }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button (click)="ver(u)" aria-label="Ver detalles">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="u.id + '/editar'" aria-label="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="eliminar(u)" aria-label="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>
        <p class="empty" *ngIf="usuarios.length === 0">No hay usuarios registrados.</p>
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
      .chip { display: inline-block; font-family: var(--simr-body); font-size: 0.72rem; background: rgba(200,119,46,0.18); color: var(--simr-tinta); border-radius: 10px; padding: 1px 8px; margin: 0 4px 4px 0; }
      .empty { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.6; padding: 14px; }
    `,
  ],
})
export class UsuariosListaComponent implements OnInit {
  usuarios: User[] = [];
  columnas = ['username', 'nombre', 'email', 'roles', 'acciones'];
  loading = false;
  error = '';

  constructor(
    private usersService: UsersService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  roleNames(u: User): string[] {
    return (u.roles || []).map((r) => (typeof r === 'string' ? r : r.name));
  }

  ver(u: User): void {
    this.dialog.open(UserDetailDialogComponent, {
      data: { id: u.id || (u as any)._id },
      width: '520px',
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  eliminar(u: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar usuario',
        message: `¿Confirma eliminar a "${u.username}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok || !u.id) {
        return;
      }
      this.usersService.remove(u.id).subscribe({
        next: () => {
          this.snack.open('Usuario eliminado.', 'Cerrar', { duration: 2500 });
          this.load();
        },
        error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
      });
    });
  }
}
