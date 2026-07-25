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
import { ObrasStore } from '../../../data/obras.store';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS = [
  { key: 'titulo', label: 'Título', required: true },
  { key: 'tipo', label: 'Tipo' },
  { key: 'denominacionRegional', label: 'Denominación Regional' },
  { key: 'actores', label: 'Actores' },
  { key: 'generosFormas', label: 'Géneros musicales' },
  { key: 'GenerosFormasNoMusicales', label: 'Gén. no musicales' },
  { key: 'idiomas', label: 'Idiomas' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'materias', label: 'Materias' },
  { key: 'mediosSonoros', label: 'Medios sonoros' },
  { key: 'sistemasSonoros', label: 'Sistemas sonoros' },
  { key: 'proyectos', label: 'Proyectos' },
  { key: 'creador', label: 'Creador' },
  { key: 'creado', label: 'Creado' },
];

const PREFS_KEY_TABLE = 'obraTableFields';
const PREFS_KEY_CARD = 'obraCardFields';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  titulo: { key: 'titulo', label: 'Título', sortable: true, truncateTo: 40 },
  tipo: { key: 'tipo', label: 'Tipo', sortable: true, truncateTo: 20 },
  denominacionRegional: { key: 'denominacionRegional', label: 'Denominación Regional', type: 'number', sortable: true },
  actores: { key: 'actores', label: 'Actores', type: 'number', sortable: true },
  generosFormas: { key: 'generosFormas', label: 'Géneros musicales', type: 'number', sortable: true },
  GenerosFormasNoMusicales: { key: 'GenerosFormasNoMusicales', label: 'Gén. no musicales', type: 'number', sortable: true },
  idiomas: { key: 'idiomas', label: 'Idiomas', type: 'number', sortable: true },
  descripcion: { key: 'descripcion', label: 'Descripción', sortable: true, truncateTo: 40 },
  materias: { key: 'materias', label: 'Materias', type: 'number', sortable: true },
  mediosSonoros: { key: 'mediosSonoros', label: 'Medios sonoros', type: 'number', sortable: true },
  sistemasSonoros: { key: 'sistemasSonoros', label: 'Sistemas sonoros', type: 'number', sortable: true },
  proyectos: { key: 'proyectos', label: 'Proyectos', type: 'number', sortable: true },
  creador: { key: 'creador', label: 'Creador', sortable: true },
  creado: { key: 'creado', label: 'Creado', type: 'date', sortable: true },
};

@Component({
  selector: 'app-obras-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatChipsModule, MatDialogModule, MatTooltipModule,
    FilterBarComponent, ViewToggleComponent, DataTableComponent,
  ],
  providers: [ObrasStore],
  template: `
    <div class="obras-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Catalogación</p>
          <h1>Obras</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nueva Obra
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

      @if (store.hasObras() && !store.isLoading()) {
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredObras().length }} de {{ store.obrasCount() }}</p>
          <div class="toolbar-actions">
            <app-filter-bar
              placeholder="Buscar por título..."
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
          <div class="obras-grid">
            @for (o of filteredObras(); track o._id) {
              <mat-card class="obra-card" appearance="outlined" (click)="navigateToDetail(o._id)">
                <mat-card-header>
                  <mat-card-title>{{ o.titulo }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta">
                    @if (cardFieldVisible('tipo') && o.tipo) {
                      <div class="meta-row">
                        <mat-icon>category</mat-icon>
                        <span>{{ o.tipo }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('denominacionRegional') && o.denominacionRegional?.length) {
                      <div class="meta-row">
                        <mat-icon>language</mat-icon>
                        <span>{{ o.denominacionRegional.length }} denominación(es)</span>
                      </div>
                    }
                    @if (cardFieldVisible('actores') && o.actores?.length) {
                      <div class="meta-row">
                        <mat-icon>people</mat-icon>
                        <span>{{ o.actores.length }} actor(es)</span>
                      </div>
                    }
                    @if (cardFieldVisible('generosFormas') && o.generosFormas?.length) {
                      <div class="meta-row">
                        <mat-icon>music_note</mat-icon>
                        <span>{{ o.generosFormas.length }} género(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('idiomas') && o.idiomas?.length) {
                      <div class="meta-row">
                        <mat-icon>language</mat-icon>
                        <span>{{ o.idiomas.length }} idioma(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('descripcion') && o.descripcion) {
                      <div class="meta-row">
                        <mat-icon>description</mat-icon>
                        <span>{{ o.descripcion | slice:0:60 }}{{ o.descripcion.length > 60 ? '…' : '' }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('materias') && o.materias?.length) {
                      <div class="meta-row">
                        <mat-icon>book</mat-icon>
                        <span>{{ o.materias.length }} materia(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('mediosSonoros') && o.mediosSonoros?.length) {
                      <div class="meta-row">
                        <mat-icon>speaker</mat-icon>
                        <span>{{ o.mediosSonoros.length }} medio(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('sistemasSonoros') && o.sistemasSonoros?.length) {
                      <div class="meta-row">
                        <mat-icon>tune</mat-icon>
                        <span>{{ o.sistemasSonoros.length }} sistema(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('proyectos') && o.proyectos?.length) {
                      <div class="meta-row">
                        <mat-icon>assignment</mat-icon>
                        <span>{{ o.proyectos.length }} proyecto(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('creador') && o.creador) {
                      <div class="meta-row">
                        <mat-icon>person</mat-icon>
                        <span>{{ getCreadorName(o.creador) }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('creado') && o.creado) {
                      <div class="meta-row">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ o.creado | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(o._id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(o._id)" matTooltip="Eliminar">
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
              [data]="filteredObras()"
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

      @if (!store.hasObras() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>music_note</mat-icon>
          <h3>No hay obras registradas</h3>
          <p>Aún no se ha catalogado ninguna obra en el archivo.</p>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Obra
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .obras-list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
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
    .obras-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
    .obra-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .obra-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    .meta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; margin-bottom: 0.5rem; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class ObrasListComponent implements OnInit {
  protected readonly store = inject(ObrasStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>([]);
  protected cardFieldKeys = signal<string[]>([]);

  private readonly STORAGE_KEY = 'simr-view-obras';
  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredObras = computed(() => {
    const obras = this.store.obras();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return obras;
    return obras.filter((o) =>
      o.titulo.toLowerCase().includes(term)
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredObras().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
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

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/obras/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/obras', id]);
  }

  confirmDelete(id: string) {
    const obra = this.store.obras().find((o) => o._id === id);
    const name = obra?.titulo || 'esta obra';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar obra', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.delete(id);
    });
  }
}
