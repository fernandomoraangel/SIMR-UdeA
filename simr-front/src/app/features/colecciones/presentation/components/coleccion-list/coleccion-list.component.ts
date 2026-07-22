import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColeccionesStore } from '../../../state/colecciones.store';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'tipo', label: 'Tipo' },
  { key: 'fechaDeCreacion', label: 'Fecha de creación' },
  { key: 'precision', label: 'Precisión' },
  { key: 'propiedadComodato', label: 'Propiedad/Comodato' },
  { key: 'creador', label: 'Creador' },
  { key: 'creado', label: 'Creado' },
];

const PREFS_KEY_TABLE = 'coleccionTableFields';
const PREFS_KEY_CARD = 'coleccionCardFields';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  nombre: { key: 'nombre', label: 'Nombre', sortable: true, truncateTo: 30 },
  tipo: { key: 'tipo', label: 'Tipo', sortable: true },
  fechaDeCreacion: { key: 'fechaDeCreacion', label: 'Fecha de creación', type: 'date', sortable: true },
  precision: { key: 'precision', label: 'Precisión', sortable: true },
  propiedadComodato: { key: 'propiedadComodato', label: 'Propiedad/Comodato', sortable: true },
  creador: { key: 'creador', label: 'Creador', sortable: true },
  creado: { key: 'creado', label: 'Creado', type: 'date', sortable: true },
};

@Component({
  selector: 'app-colecciones-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatChipsModule, MatDialogModule, MatTooltipModule,
    FilterBarComponent, ViewToggleComponent, DataTableComponent,
  ],
  providers: [ColeccionesStore],
  template: `
    <div class="colecciones-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Fondos · Colecciones</p>
          <h1>Colecciones</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nueva Colección
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

      @if (store.hasColecciones() && !store.isLoading()) {
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredColecciones().length }} de {{ store.coleccionesCount() }}</p>
          <div class="toolbar-actions">
            <app-filter-bar
              placeholder="Buscar por nombre..."
              (searchChange)="onSearchChange($event)"
            ></app-filter-bar>
            <div class="cols-group">
              <button mat-stroked-button (click)="openColumnSelector('table')" class="cols-btn" matTooltip="Campos visibles en tabla">
                <mat-icon>view_column</mat-icon>
                Tabla
              </button>
              <button mat-stroked-button (click)="openColumnSelector('card')" class="cols-btn" matTooltip="Campos visibles en tarjetas">
                <mat-icon>grid_view</mat-icon>
                Tarjetas
              </button>
            </div>
            <app-view-toggle
              [view]="effectiveView()"
              (viewChange)="onViewChange($event)"
            ></app-view-toggle>
          </div>
        </div>

        @if (effectiveView() === 'cards') {
          <div class="colecciones-grid">
            @for (coleccion of filteredColecciones(); track coleccion._id) {
              <mat-card class="coleccion-card" appearance="outlined" (click)="navigateToDetail(coleccion._id)">
                <mat-card-header>
                  <mat-card-title>{{ coleccion.nombre }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta">
                    @if (cardFieldVisible('tipo') && coleccion.tipo) {
                      <div class="meta-row">
                        <mat-icon>category</mat-icon>
                        <span>{{ coleccion.tipo }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('fechaDeCreacion') && coleccion.fechaDeCreacion) {
                      <div class="meta-row">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ coleccion.fechaDeCreacion | date:'yyyy' }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('precision') && coleccion.precision) {
                      <div class="meta-row">
                        <mat-icon>straighten</mat-icon>
                        <span>{{ coleccion.precision }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('propiedadComodato') && coleccion.propiedadComodato) {
                      <div class="meta-row">
                        <mat-icon>description</mat-icon>
                        <span>{{ coleccion.propiedadComodato }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('creador') && coleccion.creador) {
                      <div class="meta-row">
                        <mat-icon>person</mat-icon>
                        <span>{{ getCreadorName(coleccion.creador) }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('creado') && coleccion.creado) {
                      <div class="meta-row">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ coleccion.creado | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(coleccion._id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(coleccion._id)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        } @else {
          <mat-card appearance="outlined" class="table-card">
            <app-data-table
              [columns]="visibleColumns()"
              [data]="filteredColecciones()"
              [loading]="store.isLoading()"
              [showView]="true"
              [showEdit]="true"
              [showDelete]="true"
              (rowClick)="navigateToDetail($event._id)"
              (edit)="navigateToEdit($event._id)"
              (delete)="confirmDelete($event._id)"
            ></app-data-table>
          </mat-card>
        }
      }

      @if (!store.hasColecciones() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>collections_bookmark</mat-icon>
          <h3>No hay colecciones registradas</h3>
          <p>Aún no se ha creado ninguna colección en el archivo.</p>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Colección
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .colecciones-list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .header h1 { margin: 0.2em 0 0; }
    .barra { margin-bottom: 1rem; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .toolbar .simr-codigo { margin: 0; }
    .toolbar-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .cols-group { display: flex; gap: 0.35rem; }
    .cols-btn { white-space: nowrap; font-size: 0.82rem; line-height: 32px; }
    .cols-btn mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 2px; }
    .colecciones-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
    .coleccion-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .coleccion-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    .meta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; margin-bottom: 0.5rem; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class ColeccionesListComponent implements OnInit {
  protected readonly store = inject(ColeccionesStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>([]);
  protected cardFieldKeys = signal<string[]>([]);

  private readonly STORAGE_KEY = 'simr-view-colecciones';
  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredColecciones = computed(() => {
    const colecciones = this.store.colecciones();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return colecciones;
    return colecciones.filter((c) =>
      c.nombre.toLowerCase().includes(term)
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredColecciones().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
  });

  ngOnInit() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'cards' || saved === 'table') {
      this.savedView.set(saved);
    }
    this.store.setInitialState();
    this.store.loadColecciones();
    this.store.clearSuccess();
    this.loadPreferences();
  }

  private loadPreferences() {
    this.loadFieldPrefs(PREFS_KEY_TABLE, this.tableFieldKeys);
    this.loadFieldPrefs(PREFS_KEY_CARD, this.cardFieldKeys);
  }

  private loadFieldPrefs(prefKey: string, target: ReturnType<typeof signal<string[]>>) {
    const stored = localStorage.getItem(prefKey);
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        if (Array.isArray(keys) && keys.length > 0) {
          target.set(keys);
          return;
        }
      } catch { }
    }
    this.prefsService.getPreferences(prefKey).subscribe({
      next: (prefs: any) => {
        if (Array.isArray(prefs) && prefs.length > 0) {
          target.set(prefs);
        } else if (typeof prefs === 'object' && prefs !== null) {
          const keys = Object.entries(prefs)
            .filter(([, v]) => v)
            .map(([k]) => k);
          if (keys.length > 0) target.set(keys);
        }
        if (target().length === 0) target.set(ALL_FIELDS.map((f) => f.key));
      },
      error: () => target.set(ALL_FIELDS.map((f) => f.key)),
    });
  }

  protected cardFieldVisible(key: string): boolean {
    return this.cardFieldKeys().includes(key);
  }

  protected getCreadorName(creador: any): string {
    if (!creador) return '—';
    if (typeof creador === 'object' && creador.fullName) return creador.fullName;
    if (typeof creador === 'object' && (creador.firstName || creador.lastName)) {
      return [creador.firstName, creador.lastName].filter(Boolean).join(' ');
    }
    return String(creador);
  }

  openColumnSelector(view: 'table' | 'card') {
    const isTable = view === 'table';
    const prefKey = isTable ? PREFS_KEY_TABLE : PREFS_KEY_CARD;
    const currentKeys = isTable ? this.tableFieldKeys() : this.cardFieldKeys();
    const targetSignal = isTable ? this.tableFieldKeys : this.cardFieldKeys;

    const opts: ColumnOption[] = ALL_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      checked: f.required || currentKeys.includes(f.key),
    }));
    const required = ALL_FIELDS.filter((f) => f.required).map((f) => f.key);
    const ref = this.dialog.open(ColumnSelectorComponent, {
      data: { columns: opts, required, title: isTable ? 'Campos en tabla' : 'Campos en tarjetas' },
      width: '360px',
    });
    ref.afterClosed().subscribe((result: ColumnOption[] | null) => {
      if (!result) return;
      const keys = result.filter((c) => c.checked).map((c) => c.key);
      targetSignal.set(keys);
      localStorage.setItem(prefKey, JSON.stringify(keys));
      this.prefsService.updatePreferences({ [prefKey]: keys }).subscribe();
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  onViewChange(mode: ViewMode) {
    this.savedView.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/colecciones/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/colecciones', id]);
  }

  confirmDelete(id: string) {
    const coleccion = this.store.colecciones().find((c) => c._id === id);
    const name = coleccion?.nombre || 'esta colección';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar colección', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.deleteColeccion(id);
    });
  }
}
