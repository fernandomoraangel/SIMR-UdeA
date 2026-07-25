import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AuditoriaService, AuditLog } from './auditoria.service';
import { FilterBarComponent } from '../../../shared/components/filter-bar/filter-bar.component';

const ACCIONES = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'role_created',
  'role_updated',
  'role_deleted',
  'role_assigned',
  'user_created',
  'user_updated',
  'user_deleted',
];

const ENTIDADES = [
  { value: 'obra', label: 'Obras' },
  { value: 'actor', label: 'Actores' },
  { value: 'recurso', label: 'Recursos' },
  { value: 'instrumento', label: 'Instrumentos' },
  { value: 'sistema', label: 'Sistemas' },
  { value: 'medio', label: 'Medios' },
  { value: 'genero', label: 'Géneros' },
  { value: 'genero_nomusical', label: 'Géneros no musicales' },
  { value: 'materia', label: 'Materias' },
  { value: 'fondo', label: 'Fondos' },
  { value: 'coleccion', label: 'Colecciones' },
  { value: 'ejemplar', label: 'Ejemplares' },
  { value: 'idioma', label: 'Idiomas' },
  { value: 'proyecto', label: 'Proyectos' },
  { value: 'support_ticket', label: 'SoporteTicket' },
  { value: 'usos', label: 'Usos' },
  { value: 'lista', label: 'Listas' },
  { value: 'diccionario', label: 'Diccionarios' },
  { value: 'user', label: 'Usuarios' },
  { value: 'role', label: 'Roles' },
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
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FilterBarComponent,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <div>
          <p class="simr-eyebrow">Administración</p>
          <h1 class="admin-title">Auditoría del Sistema</h1>
        </div>
      </header>

      <app-filter-bar
        [placeholder]="'Buscar en auditoría por usuario, objetivo o detalle...'"
        (searchChange)="onSearchChange($event)"
      >
        <mat-form-field appearance="outline" class="filter-action">
          <mat-label>Acción</mat-label>
          <mat-select [(value)]="filtroAccion" (selectionChange)="aplicarFiltro()">
            <mat-option value="">Todas</mat-option>
            <mat-option *ngFor="let a of acciones" [value]="a">{{ a }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-entity">
          <mat-label>Entidad</mat-label>
          <mat-select [(value)]="filtroEntidad" (selectionChange)="aplicarFiltro()">
            <mat-option value="">Todas</mat-option>
            <mat-option *ngFor="let e of entidades" [value]="e.value">{{ e.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-date">
          <mat-label>Desde</mat-label>
          <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="dateFrom" (dateChange)="aplicarFiltro()" placeholder="DD/MM/AAAA" />
          <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
          <mat-datepicker #pickerFrom></mat-datepicker>
        </mat-form-field>

        <span class="date-sep">–</span>

        <mat-form-field appearance="outline" class="filter-date">
          <mat-label>Hasta</mat-label>
          <input matInput [matDatepicker]="pickerTo" [(ngModel)]="dateTo" (dateChange)="aplicarFiltro()" placeholder="DD/MM/AAAA" />
          <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
          <mat-datepicker #pickerTo></mat-datepicker>
        </mat-form-field>

        <button mat-stroked-button color="warn" (click)="limpiarFiltro()" *ngIf="hayFiltrosActivos()">
          <mat-icon>clear</mat-icon> Limpiar
        </button>
      </app-filter-bar>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
      <div *ngIf="error" class="admin-error">{{ error }}</div>

      <mat-card appearance="outlined" *ngIf="!loading && !error" class="table-card">
        <table mat-table [dataSource]="logs" matSort [matSortActive]="sortField" [matSortDirection]="sortDir" (matSortChange)="onSortChange($event)" class="admin-table">
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="action">Acción</th>
            <td mat-cell *matCellDef="let l"><span class="badge-accion" [ngClass]="getBadgeClass(l.action)">{{ l.action }}</span></td>
          </ng-container>

          <ng-container matColumnDef="performedBy">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="performedBy">Autor</th>
            <td mat-cell *matCellDef="let l">
              <span class="autor-nombre">{{ nombre(l.performedBy) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="objetivo">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="targetType">Objetivo</th>
            <td mat-cell *matCellDef="let l">
              <span class="objetivo-texto">{{ objetivo(l) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="createdAt">Fecha</th>
            <td mat-cell *matCellDef="let l" class="fecha-col">{{ l.createdAt | date:'medium' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>

        <p class="empty" *ngIf="logs.length === 0">No hay registros de auditoría que coincidan con los filtros.</p>

        <mat-paginator *ngIf="logs.length > 0" [length]="total" [pageSize]="pageSize"
          [pageIndex]="pageIndex" [pageSizeOptions]="[20, 50, 100]" (page)="cambiarPagina($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 1100px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.9rem; margin: 0; }
      .filter-action, .filter-entity { min-width: 160px; }
      .filter-date { width: 160px; }
      .date-sep { opacity: 0.4; padding: 0 0.15rem; font-size: 0.85rem; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
      .admin-error { color: var(--simr-sello); font-family: var(--simr-body); padding: 14px; }
      .table-card { margin-top: 14px; overflow: hidden; }
      .admin-table { width: 100%; border-collapse: collapse; }
      .admin-table th { background: var(--simr-papel); color: var(--simr-tinta); font-weight: 600; padding: 10px 14px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .admin-table td { padding: 10px 14px; border-bottom: 1px solid var(--mat-sys-outline-variant, #e0e0e0); font-size: 0.88rem; }
      .admin-table tr:hover td { background: rgba(200, 119, 46, 0.04); }
      .badge-accion { font-family: var(--simr-mono); font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; display: inline-block; background: #eee; color: #333; }
      .badge-create { background: #e8f5e9; color: #2e7d32; }
      .badge-update { background: #e3f2fd; color: #1565c0; }
      .badge-delete { background: #ffebee; color: #c62828; }
      .badge-login { background: #f3e5f5; color: #6a1b9a; }
      .autor-nombre { font-weight: 500; color: var(--simr-tinta); }
      .objetivo-texto { color: #444; }
      .fecha-col { white-space: nowrap; color: #666; font-size: 0.82rem; }
      .empty { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.6; padding: 24px; text-align: center; margin: 0; }
    `,
  ],
})
export class AuditoriaListaComponent implements OnInit {
  logs: AuditLog[] = [];
  columnas = ['action', 'performedBy', 'objetivo', 'fecha'];
  acciones = ACCIONES;
  entidades = ENTIDADES;
  filtroAccion = '';
  filtroEntidad = '';
  searchTerm = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  sortField = 'createdAt';
  sortDir: 'asc' | 'desc' = 'desc';
  loading = false;
  error = '';
  total = 0;
  pageSize = 50;
  pageIndex = 0;

  constructor(private auditoria: AuditoriaService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const dateFromStr = this.dateFrom ? this.formatDate(this.dateFrom) : undefined;
    const dateToStr = this.dateTo ? this.formatDate(this.dateTo) : undefined;

    this.auditoria
      .list({
        action: this.filtroAccion || undefined,
        targetType: this.filtroEntidad || undefined,
        search: this.searchTerm || undefined,
        dateFrom: dateFromStr,
        dateTo: dateToStr,
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

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  onSortChange(sort: Sort): void {
    if (sort.active) {
      this.sortField = sort.active;
      this.sortDir = (sort.direction as 'asc' | 'desc') || 'desc';
      this.pageIndex = 0;
      this.load();
    }
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtroAccion || this.filtroEntidad || this.searchTerm || this.dateFrom || this.dateTo);
  }

  limpiarFiltro(): void {
    this.filtroAccion = '';
    this.filtroEntidad = '';
    this.searchTerm = '';
    this.dateFrom = null;
    this.dateTo = null;
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

  getBadgeClass(action: string): string {
    if (!action) return '';
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('created')) return 'badge-create';
    if (act.includes('update') || act.includes('updated') || act.includes('assigned')) return 'badge-update';
    if (act.includes('delete') || act.includes('deleted')) return 'badge-delete';
    if (act.includes('login') || act.includes('logout')) return 'badge-login';
    return '';
  }
}
