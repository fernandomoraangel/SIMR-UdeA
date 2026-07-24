import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActoresStore } from '../../../data/actores.store';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS = [
  { key: 'fullName', label: 'Nombre completo', required: true },
  { key: 'nombreReunion', label: 'Nombre de reunión' },
  { key: 'contenedor', label: 'Contenedores' },
  { key: 'anotacionCartograficoTemporal', label: 'Anotaciones CT' },
  { key: 'descriptores', label: 'Descriptores' },
  { key: 'vinculoRelacionado', label: 'Vínculos' },
  { key: 'archivosAdjuntos', label: 'Archivos' },
  { key: 'creador', label: 'Creador' },
  { key: 'creado', label: 'Creado' },
];

const PREFS_KEY_TABLE = 'actorTableFields';
const PREFS_KEY_CARD = 'actorCardFields';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  fullName: { key: 'fullName', label: 'Nombre completo', sortable: true, truncateTo: 35 },
  nombreReunion: { key: 'nombreReunion', label: 'Nombre de reunión', sortable: true, truncateTo: 30 },
  contenedor: { key: 'contenedor', label: 'Contenedores', type: 'number', sortable: true },
  anotacionCartograficoTemporal: { key: 'anotacionCartograficoTemporal', label: 'Anotaciones CT', type: 'number', sortable: true },
  descriptores: { key: 'descriptores', label: 'Descriptores', type: 'chips', chipKey: 'etiqueta' },
  vinculoRelacionado: { key: 'vinculoRelacionado', label: 'Vínculos', type: 'number', sortable: true },
  archivosAdjuntos: { key: 'archivosAdjuntos', label: 'Archivos', type: 'number', sortable: true },
  creador: { key: 'creador', label: 'Creador', sortable: true },
  creado: { key: 'creado', label: 'Creado', type: 'date', sortable: true },
};

@Component({
  selector: 'app-actores-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatDialogModule, MatTooltipModule,
    FilterBarComponent, ViewToggleComponent, DataTableComponent,
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
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredActores().length }} de {{ store.actoresCount() }}</p>
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
          <div class="grid">
            @for (a of filteredActores(); track a._id) {
              <mat-card class="card" appearance="outlined" (click)="navigateToDetail(a._id)">
                <mat-card-header>
                  <mat-card-title>{{ a.fullName || a.nombres + ' ' + a.apellidos }}</mat-card-title>
                  <span class="simr-codigo">ID {{ a._id.slice(-6) }}</span>
                </mat-card-header>
                <mat-card-content>
                  @if (cardFieldVisible('contenedor') && a.contenedor?.length) {
                    <div class="meta-row">
                      <mat-icon>link</mat-icon>
                      <span>{{ a.contenedor.length }} contenedor(es)</span>
                    </div>
                  }
                  @if (cardFieldVisible('anotacionCartograficoTemporal') && a.anotacionCartograficoTemporal?.length) {
                    <div class="meta-row">
                      <mat-icon>map</mat-icon>
                      <span>{{ a.anotacionCartograficoTemporal.length }} anotación(es)</span>
                    </div>
                  }
                  @if (cardFieldVisible('descriptores') && a.descriptores?.length) {
                    <div class="meta-row">
                      <mat-icon>local_offer</mat-icon>
                      <span>{{ a.descriptores.length }} descriptor(es)</span>
                    </div>
                  }
                  @if (cardFieldVisible('vinculoRelacionado') && a.vinculoRelacionado?.length) {
                    <div class="meta-row">
                      <mat-icon>language</mat-icon>
                      <span>{{ a.vinculoRelacionado.length }} vínculo(s)</span>
                    </div>
                  }
                  @if (cardFieldVisible('archivosAdjuntos') && a.archivosAdjuntos?.length) {
                    <div class="meta-row">
                      <mat-icon>attach_file</mat-icon>
                      <span>{{ a.archivosAdjuntos.length }} archivo(s)</span>
                    </div>
                  }
                  @if (cardFieldVisible('creador') && a.creador) {
                    <div class="meta-row">
                      <mat-icon>person</mat-icon>
                      <span>{{ getCreadorName(a.creador) }}</span>
                    </div>
                  }
                  @if (cardFieldVisible('creado') && a.creado) {
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
        } @else {
          <mat-card appearance="outlined" class="table-card">
            <app-data-table
              [columns]="visibleColumns()"
              [data]="filteredActores()"
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
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .toolbar .simr-codigo { margin: 0; }
    .toolbar-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .cols-group { display: flex; gap: 0.35rem; }
    .cols-btn { white-space: nowrap; font-size: 0.82rem; line-height: 32px; }
    .cols-btn mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 2px; }
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
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class ActoresListComponent implements OnInit {
  protected readonly store = inject(ActoresStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>([]);
  protected cardFieldKeys = signal<string[]>([]);

  private readonly STORAGE_KEY = 'simr-view-actores';
  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredActores = computed(() => {
    const actores = this.store.actores();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return actores;
    return actores.filter((a) =>
      (a.fullName || a.nombres + ' ' + a.apellidos).toLowerCase().includes(term)
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredActores().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
  });

  ngOnInit() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'cards' || saved === 'table') {
      this.savedView.set(saved);
    }
    this.store.setInitialState();
    this.store.loadAll();
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
          const keys = Object.entries(prefs).filter(([, v]) => v).map(([k]) => k);
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
