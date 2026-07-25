import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@env/environment';
import { IdiomasStore } from '../../../state/idiomas.store';
import { IdiomasService } from '../../../data/idiomas.service';
import { FilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { ViewToggleComponent, ViewMode } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { ColumnSelectorComponent, ColumnOption } from '../../../../../shared/column-selector/column-selector.component';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';

const ALL_FIELDS = [
  { key: 'idioma', label: 'Idioma (español)', required: true },
  { key: 'endonym', label: 'Endónimo' },
  { key: 'glottocode', label: 'Glottocode' },
  { key: 'isoCode', label: 'ISO 639-3' },
  { key: 'linguisticFamily', label: 'Familia lingüística' },
  { key: 'transmissionMode', label: 'Transmisión' },
  { key: 'territorialContext', label: 'Contexto territorial' },
];

const PREFS_KEY_TABLE = 'idiomaTableFields';
const PREFS_KEY_CARD = 'idiomaCardFields';
const STORAGE_KEY = 'simr-view-idiomas';

const TABLE_COL_MAP: Record<string, TableColumn> = {
  idioma: { key: 'idioma', label: 'Idioma (español)', sortable: true, truncateTo: 30 },
  endonym: { key: 'endonym', label: 'Endónimo', sortable: true, truncateTo: 30 },
  glottocode: { key: 'glottocode', label: 'Glottocode', sortable: true },
  isoCode: { key: 'isoCode', label: 'ISO', sortable: true },
  linguisticFamily: { key: 'linguisticFamily', label: 'Familia', sortable: true, truncateTo: 25 },
  transmissionMode: { key: 'transmissionMode', label: 'Transmisión', sortable: true },
  territorialContext: { key: 'territorialContext', label: 'Contexto territorial', sortable: false, truncateTo: 30 },
};

const CARD_DISPLAY_FIELDS = [
  'idioma', 'endonym', 'glottocode', 'linguisticFamily', 'transmissionMode',
];

@Component({
  selector: 'app-idiomas-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatChipsModule, MatDialogModule, MatTooltipModule,
    FilterBarComponent, ViewToggleComponent, DataTableComponent,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="idiomas-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Vocabularios controlados</p>
          <h1>Idiomas</h1>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="seedFromJson()" [disabled]="seeding()" matTooltip="Cargar lenguas desde el semillero">
            <mat-icon>database_upload</mat-icon>
            {{ seeding() ? 'Cargando…' : 'Semillero' }}
          </button>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Nuevo Idioma
          </a>
        </div>
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

      @if (seedResult(); as result) {
        <div class="seed-result" [class.success]="result.creadas > 0">
          <mat-icon>{{ result.creadas > 0 ? 'check_circle' : 'info' }}</mat-icon>
          <span>{{ result.message }}</span>
          <button mat-icon-button (click)="seedResult.set(null)"><mat-icon>close</mat-icon></button>
        </div>
      }

      @if (store.hasIdiomas() && !store.isLoading()) {
        <div class="toolbar">
          <p class="simr-codigo">Total: {{ filteredIdiomas().length }} de {{ store.idiomasCount() }}</p>
          <div class="toolbar-actions">
            <app-filter-bar
              placeholder="Buscar por idioma…"
              (searchChange)="onSearchChange($event)"
            ></app-filter-bar>
            <app-view-toggle
              [view]="effectiveView()"
              (viewChange)="onViewChange($event)"
            ></app-view-toggle>
          </div>
        </div>

        @if (effectiveView() === 'cards') {
          <div class="idiomas-grid">
            @for (idioma of filteredIdiomas(); track idioma._id) {
              <mat-card class="idioma-card" appearance="outlined" (click)="navigateToDetail(idioma._id)">
                <mat-card-header>
                  <mat-card-title>{{ idioma.idioma }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta">
                    @if (idioma.endonym) {
                      <div class="meta-row">
                        <mat-icon>translate</mat-icon>
                        <span>{{ idioma.endonym }}</span>
                      </div>
                    }
                    @if (idioma.glottocode) {
                      <div class="meta-row">
                        <mat-icon>code</mat-icon>
                        <code>{{ idioma.glottocode }}</code>
                      </div>
                    }
                    @if (idioma.linguisticFamily) {
                      <div class="meta-row">
                        <mat-icon>account_tree</mat-icon>
                        <span>{{ idioma.linguisticFamily }}</span>
                      </div>
                    }
                    @if (idioma.transmissionMode) {
                      <div class="meta-row">
                        <mat-icon>record_voice_over</mat-icon>
                        <span>{{ idioma.transmissionMode }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <button mat-icon-button (click)="$event.stopPropagation(); navigateToEdit(idioma._id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="$event.stopPropagation(); confirmDelete(idioma._id)" matTooltip="Eliminar">
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
              [data]="filteredIdiomas()"
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

      @if (!store.hasIdiomas() && !store.isLoading()) {
        <div class="vacio">
          <mat-icon>translate</mat-icon>
          <h3>No hay idiomas registrados</h3>
          <p>Aún no se ha catalogado ningún idioma en el archivo.</p>
          <button mat-stroked-button (click)="seedFromJson()" [disabled]="seeding()">
            <mat-icon>database_upload</mat-icon>
            Cargar desde semillero
          </button>
          <a mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Agregar Idioma
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .idiomas-list-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .header h1 { margin: 0.2em 0 0; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }
    .barra { margin-bottom: 1rem; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .seed-result { display: flex; align-items: center; gap: 0.75rem; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .seed-result.success { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .toolbar .simr-codigo { margin: 0; }
    .toolbar-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .idiomas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
    .idioma-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
    .idioma-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important; }
    mat-card-title { font-family: var(--simr-display); font-weight: 600; font-size: 1.15rem; color: var(--simr-tinta); }
    .meta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--simr-musgo); }
    .meta-row code { font-family: var(--simr-mono); font-size: 0.85rem; color: var(--simr-musgo); background: rgba(31,42,36,0.06); padding: 0.05rem 0.3rem; border-radius: 3px; }
    .vacio { text-align: center; padding: 4rem 2rem; color: var(--simr-tinta-2); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .vacio mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--simr-cobre); opacity: 0.7; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
  `],
})
export class IdiomasListComponent implements OnInit {
  protected readonly store = inject(IdiomasStore);
  private readonly router: Router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly prefsService = inject(UserPreferencesService);
  private readonly http = inject(HttpClient);
  private readonly idiomasService = inject(IdiomasService);

  protected searchTerm = signal('');
  protected savedView = signal<ViewMode | null>(null);
  protected tableFieldKeys = signal<string[]>(ALL_FIELDS.map((f) => f.key));
  protected cardFieldKeys = signal<string[]>(ALL_FIELDS.map((f) => f.key));
  protected seeding = signal(false);
  protected seedResult = signal<{ message: string; creadas: number } | null>(null);

  private readonly AUTO_TABLE_THRESHOLD = 25;

  protected visibleColumns = computed<TableColumn[]>(() => {
    const keys = this.tableFieldKeys();
    return keys.filter((k) => TABLE_COL_MAP[k]).map((k) => TABLE_COL_MAP[k]);
  });

  protected filteredIdiomas = computed(() => {
    const idiomas = this.store.idiomas();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return idiomas;
    return idiomas.filter((m) =>
      m.idioma.toLowerCase().includes(term) ||
      (m.endonym || '').toLowerCase().includes(term) ||
      (m.glottocode || '').toLowerCase().includes(term)
    );
  });

  protected effectiveView = computed<ViewMode>(() => {
    const saved = this.savedView();
    if (saved) return saved;
    return this.filteredIdiomas().length > this.AUTO_TABLE_THRESHOLD ? 'table' : 'cards';
  });

  ngOnInit() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'cards' || saved === 'table') {
      this.savedView.set(saved);
    }
    this.store.setInitialState();
    this.store.loadIdiomas();
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

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  onViewChange(mode: ViewMode) {
    this.savedView.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/idiomas/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/idiomas', id]);
  }

  confirmDelete(id: string) {
    const idioma = this.store.idiomas().find((m) => m._id === id);
    const name = idioma?.idioma || 'este idioma';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar idioma', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.deleteIdioma(id);
    });
  }

  protected seedFromJson() {
    this.seeding.set(true);
    this.seedResult.set(null);
    this.idiomasService.seed().subscribe({
      next: (res) => {
        this.seeding.set(false);
        this.seedResult.set({ message: res.message, creadas: res.creadas });
        this.store.loadIdiomas();
      },
      error: (err) => {
        this.seeding.set(false);
        this.seedResult.set({ message: 'Error al cargar semillero: ' + (err?.error?.message || err.message), creadas: 0 });
      },
    });
  }
}
