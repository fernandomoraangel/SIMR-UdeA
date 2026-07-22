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
import { MateriasStore } from '../../../state/materias.store';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'alias', label: 'Alias' },
  { key: 'materiasRelacionadas', label: 'Materias relacionadas' },
  { key: 'padres', label: 'Materias padre' },
  { key: 'hijos', label: 'Materias hijas' },
  { key: 'descriptorLibre', label: 'Descriptores libres' },
  { key: 'vinculoRelacionado', label: 'Vínculos relacionados' },
  { key: 'archivosAdjuntos', label: 'Archivos' },
  { key: 'creador', label: 'Creador' },
  { key: 'creado', label: 'Fecha de creación' },
];

const PREFS_KEY_TABLE = 'materiaTableFields';
const PREFS_KEY_CARD = 'materiaCardFields';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  nombre: { key: 'nombre', label: 'Nombre', sortable: true },
  descripcion: { key: 'descripcion', label: 'Descripción', width: '300px', sortable: true },
  alias: { key: 'alias', label: 'Alias', type: 'chips', chipKey: 'nombre', sortable: true },
  materiasRelacionadas: { key: 'materiasRelacionadas', label: 'Relacionadas', type: 'number', sortable: true },
  padres: { key: 'padres', label: 'Padres', type: 'number', sortable: true },
  hijos: { key: 'hijos', label: 'Hijas', type: 'number', sortable: true },
  creador: { key: 'creador', label: 'Creador', sortable: true },
  creado: { key: 'creado', label: 'Creado', type: 'date', sortable: true },
};

@Component({
  selector: 'app-materias-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    FilterBarComponent,
    ViewToggleComponent,
    DataTableComponent,
  ],
  providers: [MateriasStore],
  template: `
    <div class="materias-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Términos · Vocabulario controlado</p>
           <h1>Materias</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nueva Materia
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

      @if (store.hasMaterias() && !store.isLoading()) {
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredMaterias().length }} de {{ store.materiasCount() }}</p>
          <div class="toolbar-actions">
            <app-filter-bar
              placeholder="Buscar por nombre, alias o descripción..."
              (searchChange)="onSearchChange($event)"
            ></app-filter-bar>
            <div class="cols-group">
              <button mat-stroked-button (click)="openColumnSelector('table')" class="cols-btn" title="Campos visibles en tabla">
                <mat-icon>view_column</mat-icon>
                Tabla
              </button>
              <button mat-stroked-button (click)="openColumnSelector('card')" class="cols-btn" title="Campos visibles en tarjetas">
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
          <div class="materias-grid">
            @for (materia of filteredMaterias(); track materia._id) {
              <mat-card class="materia-card" appearance="outlined" (click)="navigateToDetail(materia._id)">
                <mat-card-header>
                  <mat-card-title>{{ materia.nombre }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (cardFieldVisible('descripcion') && materia.descripcion) {
                    <p class="descripcion">{{ materia.descripcion }}</p>
                  }
                  <div class="meta">
                    @if (cardFieldVisible('alias') && materia.alias?.length) {
                      <div class="meta-row">
                        <mat-icon>alt_route</mat-icon>
                        <span>
                          @for (a of materia.alias; track $index) {
                            <span class="badge">{{ a.nombre }}</span>
                          }
                        </span>
                      </div>
                    }
                    @if (cardFieldVisible('materiasRelacionadas') && materia.materiasRelacionadas?.length) {
                      <div class="meta-row">
                        <mat-icon>link</mat-icon>
                        <span>{{ materia.materiasRelacionadas.length }} relacionada(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('padres') && materia.padres?.length) {
                      <div class="meta-row">
                        <mat-icon>subdirectory_arrow_right</mat-icon>
                        <span>{{ materia.padres.length }} padre(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('hijos') && materia.hijos?.length) {
                      <div class="meta-row">
                        <mat-icon>subdirectory_arrow_left</mat-icon>
                        <span>{{ materia.hijos.length }} hija(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('descriptorLibre') && materia.descriptorLibre?.length) {
                      <div class="meta-row">
                        <mat-icon>local_offer</mat-icon>
                        <span>{{ materia.descriptorLibre.length }} descriptor(es)</span>
                      </div>
                    }
                    @if (cardFieldVisible('vinculoRelacionado') && materia.vinculoRelacionado?.length) {
                      <div class="meta-row">
                        <mat-icon>language</mat-icon>
                        <span>{{ materia.vinculoRelacionado.length }} enlace(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('archivosAdjuntos') && materia.archivosAdjuntos?.length) {
                      <div class="meta-row">
                        <mat-icon>attach_file</mat-icon>
                        <span>{{ materia.archivosAdjuntos.length }} archivo(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('creador') && materia.creador) {
                      <div class="meta-row">
                        <mat-icon>person</mat-icon>
                        <span>{{ getCreadorName(materia.creador) }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('creado') && materia.creado) {
                      <div class="meta-row">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ materia.creado | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(materia._id)" title="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(materia._id)" title="Eliminar">
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
              [data]="filteredMaterias()"
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

      @if (!store.hasMaterias() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>bookmark</mat-icon>
          <h3>No hay materias registradas</h3>
          <p>Aún no se ha catalogado ninguna materia en el archivo.</p>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Materia
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .materias-list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
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
    .materias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
    .materia-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .materia-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    .descripcion { color: var(--simr-tinta-2); font-size: 0.88rem; line-height: 1.5; margin: 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .badge { display: inline-block; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 4px; padding: 0.1rem 0.4rem; font-size: 0.78rem; margin: 0.1rem 0.2rem; color: var(--simr-tinta-2); }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; margin-bottom: 0.5rem; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class MateriasListComponent implements OnInit {
  protected readonly store = inject(MateriasStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>([]);
  protected cardFieldKeys = signal<string[]>([]);

  private readonly STORAGE_KEY = 'simr-view-materias';
  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredMaterias = computed(() => {
    const materias = this.store.materias();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return materias;
    return materias.filter(
      (m) =>
        m.nombre.toLowerCase().includes(term) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(term)) ||
        m.alias?.some((a) => a.nombre.toLowerCase().includes(term))
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredMaterias().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
  });

  ngOnInit() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'cards' || saved === 'table') {
      this.savedView.set(saved);
    }
    this.store.setInitialState();
    this.store.loadMaterias();
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
      next: (prefs: Record<string, boolean> | string[]) => {
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

    const opts: ColumnOption[] = ALL_FIELDS.map((f) => {
      if (f.required) return { key: f.key, label: f.label, checked: true };
      return { key: f.key, label: f.label, checked: currentKeys.includes(f.key) };
    });
    const required = ALL_FIELDS.filter((f) => f.required).map((f) => f.key);
    const ref = this.dialog.open(ColumnSelectorComponent, {
      data: {
        columns: opts,
        required,
        title: isTable ? 'Campos en tabla' : 'Campos en tarjetas',
      },
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
    this.router.navigate(['/materias/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/materias', id]);
  }

  confirmDelete(id: string) {
    const materia = this.store.materias().find((m) => m._id === id);
    const name = materia?.nombre || 'esta materia';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar materia',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.deleteMateria(id);
    });
  }
}
