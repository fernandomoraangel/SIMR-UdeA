import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface SearchResultItem {
  modelName: string;
  documentId: string;
  title: string;
  fieldPath: string;
  currentValue: string;
  selected: boolean;
}

@Component({
  selector: 'app-db-replace',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatTableModule,
    MatCheckboxModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-head">
        <div>
          <p class="simr-eyebrow">Administración</p>
          <h1 class="page-title">Reemplazar en BD</h1>
        </div>
      </header>

      <mat-card appearance="outlined" class="search-card">
        <div class="search-form">
          <mat-form-field appearance="outline" class="flex-grow" subscriptSizing="dynamic">
            <mat-label>Término a buscar</mat-label>
            <input matInput [(ngModel)]="searchTerm" placeholder="Ej: palabra mal escrita" (keyup.enter)="search()" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="search()" [disabled]="!searchTerm.trim() || loading">
            <mat-icon>search</mat-icon> Buscar
          </button>
        </div>
      </mat-card>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="38"></mat-spinner>
          <span>Recorriendo base de datos en busca de coincidencias...</span>
        </div>
      }

      @if (!loading && searched) {
        <mat-card appearance="outlined" class="results-card">
          <div class="results-head">
            <h3>Resultados encontrados ({{ filteredItems.length }} de {{ items.length }})</h3>
            <div class="actions-group">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
                <mat-label>Filtrar resultados</mat-label>
                <input matInput [(ngModel)]="filterText" placeholder="Filtrar por texto..." />
              </mat-form-field>
              <button mat-stroked-button (click)="toggleAll(true)">Marcar todos</button>
              <button mat-stroked-button (click)="toggleAll(false)">Desmarcar todos</button>
            </div>
          </div>

          @if (items.length > 0) {
            <div class="replace-bar">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-grow">
                <mat-label>Nuevo término de reemplazo</mat-label>
                <input matInput [(ngModel)]="replaceTerm" placeholder="Nuevo valor..." />
              </mat-form-field>
              <button mat-flat-button color="warn" (click)="executeReplace()" [disabled]="selectedCount === 0 || replacing">
                <mat-icon>swap_horiz</mat-icon> Reemplazar seleccionados ({{ selectedCount }})
              </button>
            </div>

            <table mat-table [dataSource]="filteredItems" class="db-table">
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="$event ? toggleAll($event.checked) : null"
                                [checked]="selectedCount > 0 && selectedCount === filteredItems.length">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let element">
                  <mat-checkbox [(ngModel)]="element.selected"></mat-checkbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="modelName">
                <th mat-header-cell *matHeaderCellDef>Modelo</th>
                <td mat-cell *matCellDef="let element"><strong>{{ element.modelName }}</strong></td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Registro</th>
                <td mat-cell *matCellDef="let element">{{ element.title }}</td>
              </ng-container>

              <ng-container matColumnDef="fieldPath">
                <th mat-header-cell *matHeaderCellDef>Campo</th>
                <td mat-cell *matCellDef="let element"><code>{{ element.fieldPath }}</code></td>
              </ng-container>

              <ng-container matColumnDef="currentValue">
                <th mat-header-cell *matHeaderCellDef>Valor actual</th>
                <td mat-cell *matCellDef="let element">{{ element.currentValue }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          } @else {
            <p class="empty">No se encontraron ocurrencias para "{{ searchTerm }}".</p>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 28px 24px 48px; }
    .page-head { margin-bottom: 20px; }
    .page-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.8rem; margin: 0; }
    .search-card, .results-card { background: var(--simr-hueso); margin-bottom: 20px; padding: 20px; border-radius: 14px !important; }
    .search-form { display: flex; gap: 12px; align-items: center; }
    .flex-grow { flex: 1; }
    .loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: var(--simr-apunte); }
    .results-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .results-head h3 { margin: 0; font-family: var(--simr-display); color: var(--simr-tinta); }
    .actions-group { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .filter-field { width: 220px; }
    .replace-bar { display: flex; gap: 12px; align-items: center; background: #fff; padding: 16px; border-radius: 10px; border: 1px solid var(--mat-sys-outline); margin-bottom: 16px; }
    .db-table { width: 100%; background: transparent; }
    .empty { text-align: center; padding: 32px; color: var(--simr-apunte); font-style: italic; }
  `]
})
export class DbReplaceComponent {
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);

  searchTerm = "";
  replaceTerm = "";
  filterText = "";
  loading = false;
  replacing = false;
  searched = false;
  items: SearchResultItem[] = [];

  displayedColumns = ["select", "modelName", "title", "fieldPath", "currentValue"];

  get filteredItems(): SearchResultItem[] {
    if (!this.filterText.trim()) return this.items;
    const f = this.filterText.toLowerCase().trim();
    return this.items.filter(i =>
      i.modelName.toLowerCase().includes(f) ||
      i.title.toLowerCase().includes(f) ||
      i.fieldPath.toLowerCase().includes(f) ||
      i.currentValue.toLowerCase().includes(f)
    );
  }

  get selectedCount(): number {
    return this.filteredItems.filter(i => i.selected).length;
  }

  search() {
    if (!this.searchTerm.trim()) return;
    this.loading = true;
    this.searched = false;
    this.http.post<any>(`${environment.apiUrl}/utils/db-search`, { term: this.searchTerm }).subscribe({
      next: (res) => {
        this.loading = false;
        this.searched = true;
        this.items = (res.data || []).map((item: any) => ({ ...item, selected: true }));
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err?.error?.message || 'Error al buscar en la base de datos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleAll(checked: boolean) {
    for (const item of this.filteredItems) {
      item.selected = checked;
    }
  }

  executeReplace() {
    const selectedItems = this.items.filter(i => i.selected);
    if (selectedItems.length === 0) return;

    this.replacing = true;
    this.http.post<any>(`${environment.apiUrl}/utils/db-replace`, {
      items: selectedItems,
      searchTerm: this.searchTerm,
      replaceTerm: this.replaceTerm
    }).subscribe({
      next: (res) => {
        this.replacing = false;
        this.snack.open(`¡Reemplazo exitoso! Se actualizaron ${res.modifiedCount} registros.`, 'Cerrar', { duration: 4000 });
        this.search();
      },
      error: (err) => {
        this.replacing = false;
        this.snack.open(err?.error?.message || 'Error al reemplazar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
