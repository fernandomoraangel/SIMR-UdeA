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
import { MatPaginatorModule, MatDatepickerModule, MatSortModule, PageEvent, MatSortEvent } from '@angular/material';
import { MatInputModule } from '@angular/material/input';

import { AuditoriaService, AuditLog } from './auditoria.service';
import { FilterBarComponent } from '../../../shared/components/filter-bar/filter-bar.component';

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
    MatDatepickerModule,
    MatSortModule,
    MatInputModule,
    FilterBarComponent,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <div>
          <h1 class="admin-title">Auditoría del Sistema</h1>
          <p class="simr-eyebrow">Registro de todas las acciones CRUD en el sistema</p>
        </div>
      </header>

      <app-filter-bar
        [placeholder]="'Buscar en auditoría...'"
        (searchChange)="onSearchChange($event)"
      >
        <mat-form-field appearance="outline" class="filter-action">
          <mat-label>Acción</mat-label>
          <mat-select [(value)]="filtroAccion" (selectionChange)="aplicarFiltro()">
            <mat-option value="">Todas</mat-option>
            <mat-option *ngFor="let a of acciones" [value]="a">{{ a }}</mat-option>
          </mat-select>
        </mat-form-field>
      </app-filter-bar>

      <mat-card appearance="outlined" class="filtros-extra">
        <mat-form-field appearance="outline" class="filter-date">
          <mat-label>Rango de fechas</mat-label>
          <input matInput [matDatepicker]="dateFrom" [(ngModel)]="dateFrom" placeholder="Desde" />
          <mat-datepicker-toggle matSuffix [for]="dateFrom"></mat-datepicker-toggle>
          <mat-datepicker #dateFrom></mat-datepicker>
          <span class="date-sep">–</span>
          <input matInput [matDatepicker]="dateTo" [(ngModel)]="dateTo" placeholder="Hasta" />
          <mat-datepicker-toggle matSuffix [for]="dateTo"></mat-datepicker-toggle>
          <mat-datepicker #dateTo></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-user">
          <mat-label>Usuario</mat-label>
          <input matInput [(ngModel)]="userId" (ngModelChange)="aplicarFiltro()" placeholder="Filtrar…" />
        </mat-form-field>
      </mat-card>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
      <div *ngIf="error" class="admin-error">{{ error }}</div>

      <mat-card appearance="outlined" *ngIf="!loading && !error" class="table-card">
        <table mat-table [dataSource]="logs" matSort>
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef mat-sort-header mat-sort-key="action">
              Acción
              <mat-sort-arrow *matSortHeaderMatSortDirection="asc" [matSortArrow]="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"></mat-sort-arrow>
            </th>
            <td mat-cell *matCellDef="let l"><span class="accion">{{ l.action }}</span></td>
          </ng-container>

          <ng-container matColumnDef="performedBy">
            <th mat-header-cell *matHeaderCellDef mat-sort-header mat-sort-key="performedBy">
              Autor
              <mat-sort-arrow *matSortHeaderMatSortDirection="asc" [matSortArrow]="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"></mat-sort-arrow>
            </th>
            <td mat-cell *matCellDef="let l">{{ nombre(l.performedBy) }}</td>
          </ng-container>

          <ng-container matColumnDef="objetivo">
            <th mat-header-cell *matHeaderCellDef mat-sort-header mat-sort-key="objetivo">
              Objetivo
              <mat-sort-arrow *matSortHeaderMatSortDirection="asc" [matSortArrow]="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"></mat-sort-arrow>
            </th>
            <td mat-cell *matCellDef="let l">{{ objetivo(l) }}</td>
          </ng-container>

          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef mat-sort-header mat-sort-key="createdAt">
              Fecha
              <mat-sort-arrow *matSortHeaderMatSortDirection="asc" [matSortArrow]="sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"></mat-sort-arrow>
            </th>
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
  styles: [`
    .admin-page { max-width: 1100px; margin: 0 auto; padding: 28px 24px 48px; }
    .admin-head { margin-bottom: 18px; }
    .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.9rem; margin: 0; }
    .simr-eyebrow { font-family: var(--simr-body); font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--simr-tinta); opacity: 0.6; margin: 6px 0 0; }
    .filter-action { min-width: 220px; }
    .filtros-extra { display: flex; gap: 12px; align-items: center; padding: 12px 16px; margin-bottom: 14px; flex-wrap: wrap; }
    .filtros-extra mat-form-field { min-width: 160px; }
    .filter-date { width: 260px; }
    .filter-date input { max-width: 130px; }
    .date-sep { opacity: 0.4; padding: 0 0.25rem; font-size: 0.85rem; }
    .filter-user { width: 200px; }
    .admin-loading { display: flex; justify-content: center; padding: 40px; }
    .admin-error { color: var(--simr-sello); font-family: var(--simr-body); padding: 14px; }
    .table-card { margin-top: 14px; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { background: var(--simr-tinta); color: #fff; font-weight: 600; padding: 10px 14px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-table th .mat-mdc-sort-header-container { justify-content: center; }
    .admin-table td { padding: 8px 14px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .admin-table tr:hover td { background: rgba(200, 119, 46, 0.04); }
    .accion { font-family: var(--simr-mono); font-size: 0.8rem; color: var(--simr-cobre); }
    .empty { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.6; padding: 14px; text-align: center; }
  `],
})
export class AuditoriaListaComponent implements OnInit {
  logs: AuditLog[] = [];
  columnas = ['action', 'performedBy', 'objetivo', 'fecha'];
  acciones = ACCIONES;
  filtroAccion = '';
  searchTerm = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  userId = '';
  sortField = 'createdAt';
  sortDir: 'asc' | 'desc' = 'desc';
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
    const dateFromStr = this.dateFrom ? new Date(this.dateFrom).toISOString().split('T')[0] : undefined;
    const dateToStr = this.dateTo ? new Date(this.dateTo).toISOString().split('T')[0] : undefined;
    this.auditoria
      .list({
        action: this.filtroAccion || undefined,
        search: this.searchTerm || undefined,
        dateFrom: dateFromStr,
        dateTo: dateToStr,
        userId: this.userId || undefined,
        sortField: this.sortField,
        sortDir: this.sortDir,
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

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.pageIndex = 0;
    this.load();
  }

  limpiarFiltro(): void {
    this.filtroAccion = '';
    this.searchTerm = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.userId = '';
    this.sortField = 'createdAt';
    this.sortDir = 'desc';
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
    const parts: string[] = [];
    if (l.targetType) parts.push(l.targetType);
    if (l.targetName) parts.push(l.targetName);
    if (l.targetUser) parts.push('Usuario: ' + this.nombre(l.targetUser));
    if (l.targetRole) parts.push('Rol: ' + (l.targetRole.name || l.targetRole.description || ''));
    return parts.join(' – ') || '—';
  }

  onSortChange(event: MatSortEvent): void {
    this.sortField = event.sortField;
    this.sortDir = event.direction;
    this.pageIndex = 0;
    this.load();
  }
}