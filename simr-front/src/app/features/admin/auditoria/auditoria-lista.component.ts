import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AuditoriaService, AuditLog } from './auditoria.service';

const ACCIONES = [
  'role_created',
  'role_updated',
  'role_deleted',
  'role_assigned',
  'user_created',
  'user_updated',
  'user_deleted',
  'login',
  'logout',
];

@Component({
  selector: 'app-auditoria-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <div>
          <h1 class="admin-title">Auditoría del Sistema</h1>
          <p class="simr-eyebrow">Registro de acciones sobre usuarios y roles</p>
        </div>
      </header>

      <mat-card appearance="outlined" class="filtros">
        <mat-form-field appearance="outline">
          <mat-label>Filtrar por acción</mat-label>
          <mat-select [(value)]="filtroAccion" (selectionChange)="aplicarFiltro()">
            <mat-option value="">Todas</mat-option>
            <mat-option *ngFor="let a of acciones" [value]="a">{{ a }}</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-stroked-button (click)="limpiarFiltro()">Limpiar</button>
      </mat-card>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
      <div *ngIf="error" class="admin-error">{{ error }}</div>

      <mat-card appearance="outlined" *ngIf="!loading && !error">
        <table mat-table [dataSource]="logs" class="admin-table">
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Acción</th>
            <td mat-cell *matCellDef="let l"><span class="accion">{{ l.action }}</span></td>
          </ng-container>
          <ng-container matColumnDef="performedBy">
            <th mat-header-cell *matHeaderCellDef>Autor</th>
            <td mat-cell *matCellDef="let l">{{ nombre(l.performedBy) }}</td>
          </ng-container>
          <ng-container matColumnDef="objetivo">
            <th mat-header-cell *matHeaderCellDef>Objetivo</th>
            <td mat-cell *matCellDef="let l">{{ objetivo(l) }}</td>
          </ng-container>
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let l">{{ l.createdAt | date:'medium' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>
        <p class="empty" *ngIf="logs.length === 0">No hay registros de auditoría.</p>
        <mat-paginator *ngIf="logs.length > 0" [length]="total" [pageSize]="pageSize"
          [pageIndex]="pageIndex" (page)="cambiarPagina($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 1000px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.9rem; margin: 0; }
      .simr-eyebrow { font-family: var(--simr-body); font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--simr-tinta); opacity: 0.6; margin: 6px 0 0; }
      .filtros { display: flex; gap: 12px; align-items: center; padding: 12px 16px; margin-bottom: 14px; }
      .filtros mat-form-field { width: 280px; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
      .admin-error { color: var(--simr-sello); font-family: var(--simr-body); padding: 14px; }
      .admin-table { width: 100%; background: var(--simr-hueso); }
      .accion { font-family: var(--simr-mono); font-size: 0.8rem; color: var(--simr-cobre); }
      .empty { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.6; padding: 14px; }
    `,
  ],
})
export class AuditoriaListaComponent implements OnInit {
  logs: AuditLog[] = [];
  columnas = ['action', 'performedBy', 'objetivo', 'fecha'];
  acciones = ACCIONES;
  filtroAccion = '';
  loading = false;
  error = '';
  total = 0;
  pageSize = 50;
  pageIndex = 0;

  constructor(private auditoria: AuditoriaService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.auditoria
      .list({
        action: this.filtroAccion || undefined,
        limit: this.pageSize,
        skip: this.pageIndex * this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.logs = res.logs || [];
          this.total = res.pagination?.total || 0;
        },
        error: (err) => (this.error = err),
        complete: () => (this.loading = false),
      });
  }

  aplicarFiltro(): void {
    this.pageIndex = 0;
    this.load();
  }

  limpiarFiltro(): void {
    this.filtroAccion = '';
    this.pageIndex = 0;
    this.load();
  }

  cambiarPagina(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  nombre(u?: AuditLog['performedBy']): string {
    if (!u) return '—';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '—';
  }

  objetivo(l: AuditLog): string {
    if (l.targetUser) return 'Usuario: ' + this.nombre(l.targetUser);
    if (l.targetRole) return 'Rol: ' + (l.targetRole.name || l.targetRole.description || '');
    return '—';
  }
}
