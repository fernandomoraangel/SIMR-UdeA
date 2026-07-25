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
import { ProyectosStore } from '../../../state/proyectos.store';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'estado', label: 'Estado' },
  { key: 'investigadores', label: 'Investigadores' },
  { key: 'fechasAsociadas', label: 'Fechas asociadas' },
  { key: 'descriptoresLibres', label: 'Descriptores' },
  { key: 'vinculoRelacionado', label: 'Vínculos' },
  { key: 'archivosAdjuntos', label: 'Archivos' },
  { key: 'creador', label: 'Creador' },
  { key: 'creado', label: 'Creado' },
];

const PREFS_KEY_TABLE = 'proyectoTableFields';
const PREFS_KEY_CARD = 'proyectoCardFields';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  nombre: { key: 'nombre', label: 'Nombre', sortable: true, truncateTo: 30 },
  estado: { key: 'estado', label: 'Estado', sortable: true },
  investigadores: { key: 'investigadores', label: 'Investigadores', type: 'number', sortable: true },
  fechasAsociadas: { key: 'fechasAsociadas', label: 'Fechas asociadas', type: 'number', sortable: true },
  descriptoresLibres: { key: 'descriptoresLibres', label: 'Descriptores', type: 'number', sortable: true },
  vinculoRelacionado: { key: 'vinculoRelacionado', label: 'Vínculos', type: 'number', sortable: true },
  archivosAdjuntos: { key: 'archivosAdjuntos', label: 'Archivos', type: 'number', sortable: true },
  creador: { key: 'creador', label: 'Creador', sortable: true },
  creado: { key: 'creado', label: 'Creado', type: 'date', sortable: true },
};

@Component({
  selector: 'app-proyecto-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatChipsModule, MatDialogModule, MatTooltipModule,
    FilterBarComponent, ViewToggleComponent, DataTableComponent,
  ],
  providers: [ProyectosStore],
  template: `
    <div class="proyectos-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Catalogación</p>
          <h1>Proyectos</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nuevo Proyecto
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

      @if (store.hasProyectos() && !store.isLoading()) {
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredProyectos().length }} de {{ store.proyectosCount() }}</p>
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
          <div class="proyectos-grid">
            @for (p of filteredProyectos(); track p._id) {
              <mat-card class="proyecto-card" appearance="outlined" (click)="navigateToDetail(p._id)">
                <mat-card-header>
                  <mat-card-title>{{ p.nombre }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta">
                    @if (cardFieldVisible('estado') && p.estado) {
                      <div class="meta-row">
                        <mat-icon>flag</mat-icon>
                        <span>{{ p.estado }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('investigadores') && p.investigadores?.length) {
                      <div class="meta-row">
                        <mat-icon>people</mat-icon>
                        <span>{{ p.investigadores.length }} investigador(es)</span>
                      </div>
                    }
                    @if (cardFieldVisible('fechasAsociadas') && p.fechasAsociadas?.length) {
                      <div class="meta-row">
                        <mat-icon>event</mat-icon>
                        <span>{{ p.fechasAsociadas.length }} fecha(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('descriptoresLibres') && p.descriptoresLibres?.length) {
                      <div class="meta-row">
                        <mat-icon>local_offer</mat-icon>
                        <span>{{ p.descriptoresLibres.length }} descriptor(es)</span>
                      </div>
                    }
                    @if (cardFieldVisible('vinculoRelacionado') && p.vinculoRelacionado?.length) {
                      <div class="meta-row">
                        <mat-icon>language</mat-icon>
                        <span>{{ p.vinculoRelacionado.length }} enlace(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('archivosAdjuntos') && p.archivosAdjuntos?.length) {
                      <div class="meta-row">
                        <mat-icon>attach_file</mat-icon>
                        <span>{{ p.archivosAdjuntos.length }} archivo(s)</span>
                      </div>
                    }
                    @if (cardFieldVisible('creador') && p.creador) {
                      <div class="meta-row">
                        <mat-icon>person</mat-icon>
                        <span>{{ getCreadorName(p.creador) }}</span>
                      </div>
                    }
                    @if (cardFieldVisible('creado') && p.creado) {
                      <div class="meta-row">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ p.creado | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(p._id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(p._id)" matTooltip="Eliminar">
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
              [data]="filteredProyectos()"
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

      @if (!store.hasProyectos() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>folder</mat-icon>
          <h3>No hay proyectos registrados</h3>
          <p>Aún no se ha creado ningún proyecto en el archivo.</p>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Proyecto
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .proyectos-list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
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
    .proyectos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
    .proyecto-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .proyecto-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    .meta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .badge { display: inline-block; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 4px; padding: 0.1rem 0.4rem; font-size: 0.78rem; margin: 0.1rem 0.2rem; color: var(--simr-tinta-2); }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; margin-bottom: 0.5rem; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class ProyectoListComponent implements OnInit {
  protected readonly store = inject(ProyectosStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>([]);
  protected cardFieldKeys = signal<string[]>([]);

  private readonly STORAGE_KEY = 'simr-view-proyectos';
  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredProyectos = computed(() => {
    const proyectos = this.store.proyectos();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return proyectos;
    return proyectos.filter((s) =>
      s.nombre.toLowerCase().includes(term)
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredProyectos().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
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
    this.router.navigate(['/proyectos/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/proyectos', id]);
  }

  confirmDelete(id: string) {
    const proyecto = this.store.proyectos().find((s) => s._id === id);
    const name = proyecto?.nombre || 'este proyecto';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar proyecto', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.delete(id);
    });
  }
}
