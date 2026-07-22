import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'chips' | 'number';
  chipKey?: string;
  width?: string;
  sortable?: boolean;
  truncateTo?: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    @if (loading()) {
      <mat-progress-bar mode="indeterminate" class="table-bar"></mat-progress-bar>
    }

    <div class="table-wrapper" [class.loading]="loading()">
      <table mat-table matSort [dataSource]="paginatedData()" class="data-table" (matSortChange)="onSort($event)">
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="!col.sortable" [style.max-width]="col.width" class="header-cell">
              <span class="header-label">{{ col.label }}</span>
            </th>
            <td mat-cell *matCellDef="let item" [style.max-width]="col.width">
              @switch (col.type) {
                @case ('chips') {
                  <span class="chip-list">
                    @for (chip of getChips(item, col); track $index) {
                      <span class="chip">{{ chip }}</span>
                    }
                  </span>
                }
                @case ('date') {
                  {{ item[col.key] ? (item[col.key] | date:'dd/MM/yyyy') : '—' }}
                }
                @case ('number') {
                  <span class="number-cell">{{ getCellValue(item, col) }}</span>
                }
                @default {
                  {{ col.truncateTo ? (getCellValue(item, col) | slice:0:col.truncateTo) : getCellValue(item, col) }}
                }
              }
            </td>
          </ng-container>
        }

        @if (showActions()) {
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef class="header-cell actions-header"></th>
            <td mat-cell *matCellDef="let item" class="actions-cell">
              @if (showView()) {
                <button mat-icon-button (click)="onRowClick(item)" aria-label="Ver" title="Ver">
                  <mat-icon>visibility</mat-icon>
                </button>
              }
              @if (showEdit()) {
                <button mat-icon-button (click)="onEdit(item); $event.stopPropagation()" aria-label="Editar" title="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
              }
              @if (showDelete()) {
                <button mat-icon-button color="warn" (click)="onDelete(item); $event.stopPropagation()" aria-label="Eliminar" title="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()" class="header-row"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()" (click)="onRowClick(row)" class="data-row"></tr>
      </table>

      @if (data().length === 0 && !loading()) {
        <p class="empty">No se encontraron registros.</p>
      }
    </div>

    @if (sortedData().length > pageSize()) {
      <mat-paginator
        [length]="sortedData().length"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        (page)="onPageChange($event)"
        showFirstLastButtons
        class="table-paginator"
      >
      </mat-paginator>
    }
  `,
  styles: [`
    .table-bar { margin-bottom: 0; border-radius: 8px 8px 0 0; }
    .table-wrapper { opacity: 1; transition: opacity 0.2s; }
    .table-wrapper.loading { opacity: 0.6; pointer-events: none; }
    .data-table { width: 100%; background: transparent; }
    .header-row { background: var(--simr-papel); }
    .header-cell { font-family: var(--simr-display); font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--simr-tinta-2); border-bottom-color: var(--mat-sys-outline) !important; padding-top: 0.85rem; padding-bottom: 0.85rem; }
    .header-label { display: inline-flex; align-items: center; gap: 0.25rem; }
    .actions-header { width: 120px; }
    .data-row { cursor: pointer; transition: background 0.15s; }
    .data-row:hover { background: rgba(31, 42, 36, 0.04); }
    .data-row td { padding-top: 0.7rem; padding-bottom: 0.7rem; color: var(--simr-tinta); font-size: 0.88rem; }
    .chip-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .chip { display: inline-block; font-size: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 4px; padding: 0.05rem 0.45rem; color: var(--simr-tinta-2); white-space: nowrap; }
    .number-cell { font-family: var(--simr-mono); font-weight: 500; color: var(--simr-tinta); }
    .actions-cell { text-align: right; white-space: nowrap; width: 120px; }
    .actions-cell button { margin: 0 -4px; }
    .table-paginator { border-top: 1px solid var(--mat-sys-outline); }
    .empty { text-align: center; padding: 2rem; color: var(--simr-tinta-2); font-size: 0.88rem; }
  `],
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<any[]>();
  readonly loading = input(false);
  readonly pageSize = input(25);
  readonly showActions = input(true);
  readonly showView = input(true);
  readonly showEdit = input(true);
  readonly showDelete = input(true);

  readonly edit = output<any>();
  readonly delete = output<any>();
  readonly rowClick = output<any>();

  protected pageIndex = signal(0);
  protected sortState = signal<Sort | null>(null);

  protected displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key);
    if (this.showActions()) cols.push('acciones');
    return cols;
  });

  protected sortedData = computed(() => {
    const all = this.data();
    const sort = this.sortState();
    if (!sort || !sort.active || sort.direction === '') return all;
    const col = this.columns().find((c) => c.key === sort.active);
    if (!col) return all;
    const sorted = [...all].sort((a: any, b: any) => {
      let valA = this.getSortValue(a, col);
      let valB = this.getSortValue(b, col);
      if (valA == null) valA = '';
      if (valB == null) valB = '';
      const cmp = typeof valA === 'string' ? valA.localeCompare(valB) : (valA < valB ? -1 : valA > valB ? 1 : 0);
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return sorted;
  });

  protected paginatedData = computed(() => {
    const all = this.sortedData();
    const size = this.pageSize();
    const start = this.pageIndex() * size;
    return all.slice(start, start + size);
  });

  onSort(sort: Sort) {
    this.sortState.set(sort);
    this.pageIndex.set(0);
  }

  onPageChange(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
  }

  onRowClick(item: any) {
    this.rowClick.emit(item);
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  getSortValue(item: any, col: TableColumn): any {
    const val = item[col.key];
    if (val == null) return '';
    if (col.type === 'chips') {
      const arr = Array.isArray(val) ? val : [];
      return arr.map((c: any) => (col.chipKey ? c[col.chipKey] : c)).join(', ');
    }
    if (col.type === 'number') {
      return Array.isArray(val) ? val.length : (typeof val === 'number' ? val : 0);
    }
    if (typeof val === 'object' && val?.fullName) return val.fullName.toLowerCase();
    if (typeof val === 'string') return val.toLowerCase();
    return val;
  }

  getChips(item: any, col: TableColumn): string[] {
    const arr = item[col.key];
    if (!Array.isArray(arr)) return [];
    return arr.map((c: any) => (col.chipKey ? c[col.chipKey] : c));
  }

  getCellValue(item: any, col: TableColumn): string {
    const val = item[col.key];
    if (val == null) return '—';
    if (col.type === 'number') {
      if (Array.isArray(val)) return String(val.length);
      return String(val);
    }
    if (typeof val === 'object' && val?.fullName) return val.fullName;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }
}
