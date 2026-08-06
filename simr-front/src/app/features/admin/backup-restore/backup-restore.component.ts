import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { SweetAlertService } from "@core/services/sweet-alert.service";
import {
  BackupRestoreService,
  EntityInfo,
  BackupData,
  RestorePreview,
  RestoreResult,
} from "./backup-restore.service";

@Component({
  selector: "app-backup-restore",
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule,
  ],
  template: `
  <div class="admin-page">
    <header class="admin-head">
      <p class="simr-eyebrow">Administración</p>
      <h1 class="admin-title">Respaldo y Restauración de Datos</h1>
    </header>

    @if (error()) {
      <div class="admin-error"><mat-icon>error_outline</mat-icon> {{ error() }}</div>
    }

    <div class="tab-bar">
      <button class="tab-btn" [class.active]="tab() === 'export'" (click)="tab.set('export')">
        <mat-icon>file_upload</mat-icon> Exportar
      </button>
      <button class="tab-btn" [class.active]="tab() === 'restore'" (click)="tab.set('restore')">
        <mat-icon>file_download</mat-icon> Restaurar
      </button>
    </div>

    @if (tab() === 'export') {
      <mat-card appearance="outlined" class="admin-card">
        <p class="card-desc">Selecciona las entidades a exportar y descarga un archivo JSON con todos sus datos.</p>

        <div class="entity-grid">
          @for (e of entities(); track e.name) {
            <label class="entity-item">
              <mat-checkbox [checked]="selected()[e.name] ?? false" (change)="toggleExportCheckbox(e.name, $event.checked)" [disabled]="loading()"></mat-checkbox>
              <span class="entity-name">{{ e.name }}</span>
              <span class="entity-meta">{{ e.count }} docs · {{ e.fields }} campos</span>
            </label>
          }
        </div>

        @if (entities().length === 0 && !loading()) {
          <p class="empty-text">No se pudieron cargar las entidades</p>
        }

        <div class="card-actions">
          <button mat-stroked-button (click)="toggleAll(true)" [disabled]="loading()">Seleccionar todo</button>
          <button mat-stroked-button (click)="toggleAll(false)" [disabled]="loading()">Deseleccionar todo</button>
          <button mat-flat-button color="primary" [disabled]="!hasSelection() || loading() || exporting()" (click)="doExport()">
            @if (exporting()) { <mat-spinner diameter="20"></mat-spinner> }
            Exportar selección
          </button>
        </div>
      </mat-card>
    }

    @if (tab() === 'restore') {
      <mat-card appearance="outlined" class="admin-card">
        <p class="card-desc">Carga un archivo JSON de respaldo para restaurar entidades. Los datos existentes serán eliminados.</p>

        <div class="upload-area-restore" [class.has-file]="backupFile()">
          <input #fileInput type="file" accept=".json" (change)="onFileSelected($event)" hidden />
          @if (!backupFile()) {
            <mat-icon>cloud_upload</mat-icon>
            <p>Selecciona un archivo .json de respaldo</p>
            <button mat-flat-button color="primary" (click)="fileInput.click()" [disabled]="loading()">Seleccionar archivo</button>
          } @else {
            <mat-icon style="color:var(--simr-musgo)">check_circle</mat-icon>
            <p><strong>{{ backupFile()!.name }}</strong></p>
            <p class="file-meta">Exportado: {{ backupData()?.exportedAt | date:'medium' }}</p>
            <button mat-stroked-button (click)="clearFile()">Quitar</button>
          }
        </div>

        @if (preview(); as p) {
          <mat-divider></mat-divider>
          <h3 class="section-title">Vista previa del respaldo</h3>
          <div class="preview-grid">
            @for (item of p; track item.name) {
              <div class="preview-item" [class.will-drop]="item.willDrop">
                <div class="preview-head">
                  <mat-checkbox [checked]="restoreSelected()[item.name] ?? true" (change)="toggleRestoreCheckbox(item.name, $event.checked)" [disabled]="restoring()"></mat-checkbox>
                  <span class="entity-name">{{ item.name }}</span>
                </div>
                <div class="preview-stats">
                  <span><strong>{{ item.incomingCount }}</strong> registros entrantes</span>
                  @if (item.currentCount > 0) {
                    <span class="drop-badge">Se eliminarán {{ item.currentCount }} existentes</span>
                  }
                  @if (item.currentCount === 0) {
                    <span class="empty-badge">Colección vacía</span>
                  }
                </div>
              </div>
            }
          </div>

          <div class="card-actions">
            <button mat-flat-button style="background:var(--simr-sello)!important;color:#fff"
                    [disabled]="!hasRestoreSelection() || restoring()" (click)="doRestore()">
              @if (restoring()) { <mat-spinner diameter="20"></mat-spinner> }
              Restaurar selección
            </button>
          </div>
        }

        @if (results(); as r) {
          @if (r.length > 0) {
            <mat-divider></mat-divider>
            <h3 class="section-title">Resultados</h3>
            <div class="results-panel">
              @for (res of r; track res.name) {
                <div class="result-row" [class.success]="res.status === 'success'"
                     [class.error]="res.status === 'error'">
                  <mat-icon>{{ res.status === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                  <span class="result-name">{{ res.name }}</span>
                  <span class="result-msg">{{ res.message }}</span>
                </div>
              }
            </div>
          }
        }
      </mat-card>
    }
  </div>
  `,
  styles: [`
    .admin-page { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .admin-head { margin-bottom: 2rem; }
    .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); margin: 0.25rem 0 0; font-size: 1.75rem; font-weight: 500; }
    .admin-error { background: rgba(181,67,42,0.08); color: var(--simr-sello); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .admin-card { padding: 2rem; border-radius: 14px; background: var(--simr-hueso); }
    .card-desc { color: var(--simr-tinta-2); margin: 0 0 1.5rem; }
    .card-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--mat-sys-outline-variant); }
    .empty-text { text-align: center; color: var(--simr-tinta-2); opacity: 0.6; padding: 2rem; }

    .tab-bar { display: flex; gap: 0; margin-bottom: 1.5rem; border-radius: 10px; overflow: hidden; border: 1px solid var(--mat-sys-outline); }
    .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1rem; border: none; background: var(--simr-hueso); color: var(--simr-tinta-2); cursor: pointer; font-size: 0.95rem; font-family: var(--simr-body); transition: all 0.15s; }
    .tab-btn:hover { background: var(--simr-papel); }
    .tab-btn.active { background: var(--simr-sello); color: #fff; font-weight: 600; }
    .tab-btn mat-icon { font-size: 1.2rem; }

    .entity-grid { display: flex; flex-direction: column; gap: 0.25rem; }
    .entity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .entity-item:hover { background: var(--simr-papel); }
    .entity-name { font-weight: 500; color: var(--simr-tinta); min-width: 140px; }
    .entity-meta { font-size: 0.8rem; color: var(--simr-tinta-2); opacity: 0.6; font-family: var(--simr-mono); }

    .upload-area-restore { text-align: center; padding: 2rem; border: 2px dashed var(--mat-sys-outline); border-radius: 12px; background: var(--simr-hueso); transition: all 0.2s; }
    .upload-area-restore.has-file { border-style: solid; border-color: var(--simr-musgo); }
    .upload-area-restore mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: var(--mat-sys-outline); margin-bottom: 0.5rem; }
    .upload-area-restore p { margin: 0.25rem 0; color: var(--simr-tinta-2); }
    .file-meta { font-size: 0.85rem; opacity: 0.7; }
    .section-title { font-family: var(--simr-display); color: var(--simr-tinta); margin: 1.5rem 0 1rem; font-size: 1.1rem; }

    .preview-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .preview-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; background: var(--simr-papel); border-left: 3px solid var(--simr-musgo); }
    .preview-item.will-drop { border-left-color: var(--simr-sello); }
    .preview-head { display: flex; align-items: center; gap: 0.75rem; }
    .preview-stats { display: flex; gap: 0.75rem; align-items: center; font-size: 0.85rem; }
    .drop-badge { font-size: 0.75rem; background: rgba(181,67,42,0.1); color: var(--simr-sello); padding: 0.15rem 0.5rem; border-radius: 4px; }
    .empty-badge { font-size: 0.75rem; background: rgba(92,122,90,0.1); color: var(--simr-musgo); padding: 0.15rem 0.5rem; border-radius: 4px; }

    .results-panel { display: flex; flex-direction: column; gap: 0.25rem; }
    .result-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.9rem; }
    .result-row.success { background: rgba(92,122,90,0.06); }
    .result-row.error { background: rgba(181,67,42,0.06); }
    .result-row mat-icon { font-size: 1.2rem; }
    .result-row.success mat-icon { color: var(--simr-musgo); }
    .result-row.error mat-icon { color: var(--simr-sello); }
    .result-name { font-weight: 600; color: var(--simr-tinta); min-width: 140px; }
    .result-msg { color: var(--simr-tinta-2); font-size: 0.85rem; }
  `],
})
export class BackupRestoreComponent implements OnInit {
  private readonly service = inject(BackupRestoreService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sweetAlert = inject(SweetAlertService);

  tab = signal<"export" | "restore">("export");
  entities = signal<EntityInfo[]>([]);
  selected = signal<Record<string, boolean>>({});
  loading = signal(false);
  error = signal<string | null>(null);
  exporting = signal(false);

  backupFile = signal<File | null>(null);
  backupData = signal<BackupData | null>(null);
  preview = signal<RestorePreview[] | null>(null);
  restoreSelected = signal<Record<string, boolean>>({});
  restoring = signal(false);
  results = signal<RestoreResult[] | null>(null);

  hasSelection = computed(() => Object.values(this.selected()).some((v) => v));
  hasRestoreSelection = computed(() => Object.values(this.restoreSelected()).some((v) => v));

  ngOnInit() {
    this.loadEntities();
  }

  private loadEntities() {
    this.loading.set(true);
    this.error.set(null);
    this.service.listEntities().subscribe({
      next: (res) => {
        this.entities.set(res.data);
        this.selected.set(Object.fromEntries(res.data.map((e) => [e.name, false])));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || "Error al cargar entidades");
      },
    });
  }

  toggleAll(value: boolean) {
    this.selected.update((s) => {
      const next = { ...s };
      for (const k of Object.keys(next)) next[k] = value;
      return next;
    });
  }

  toggleExportCheckbox(name: string, checked: boolean) {
    this.selected.update((s) => ({ ...s, [name]: checked }));
  }

  toggleRestoreCheckbox(name: string, checked: boolean) {
    this.restoreSelected.update((s) => ({ ...s, [name]: checked }));
  }

  doExport() {
    const selectedNames = Object.entries(this.selected())
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selectedNames.length === 0) return;
    this.exporting.set(true);
    this.error.set(null);
    this.service.exportBackup(selectedNames).subscribe({
      next: (res) => {
        this.exporting.set(false);
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `simr-backup-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.snackBar.open(`Respaldo exportado: ${selectedNames.length} entidades`, "Cerrar", { duration: 4000 });
      },
      error: (err) => {
        this.exporting.set(false);
        this.error.set(err.error?.message || err.message || "Error al exportar");
      },
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clearRestoreState();
      const file = input.files[0];
      this.backupFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as BackupData;
          if (!data.data || !data.version) {
            this.error.set("El archivo no tiene el formato de respaldo SIMR válido");
            this.backupFile.set(null);
            return;
          }
          this.backupData.set(data);
          this.loadRestorePreview(data);
        } catch {
          this.error.set("Error al leer el archivo JSON");
          this.backupFile.set(null);
        }
      };
      reader.readAsText(file);
    }
  }

  private loadRestorePreview(data: BackupData) {
    this.loading.set(true);
    this.error.set(null);
    this.service.restorePreview(data).subscribe({
      next: (res) => {
        this.preview.set(res.data);
        this.restoreSelected.set(Object.fromEntries(res.data.map((e) => [e.name, true])));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || "Error al analizar respaldo");
      },
    });
  }

  clearFile() {
    this.backupFile.set(null);
    this.clearRestoreState();
  }

  private clearRestoreState() {
    this.backupData.set(null);
    this.preview.set(null);
    this.restoreSelected.set({});
    this.results.set(null);
    this.error.set(null);
  }

  async doRestore() {
    const selectedNames = Object.entries(this.restoreSelected())
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selectedNames.length === 0) return;

    const drops = this.preview()?.filter((p) => selectedNames.includes(p.name) && p.willDrop).length || 0;
    const msg = drops > 0
      ? `Se eliminarán los datos existentes de ${drops} colecciones y se insertarán los del respaldo. ¿Continuar?`
      : `Se insertarán ${selectedNames.length} entidades del respaldo. ¿Continuar?`;

    this.sweetAlert.confirm("Restaurar respaldo", msg, "Restaurar", "Cancelar")
      .then((result: any) => {
        if (!result.isConfirmed) return;
        this.restoring.set(true);
        this.error.set(null);
        this.results.set(null);
        const data = this.backupData();
        if (!data) return;
        this.service.restoreBackup(data, selectedNames).subscribe({
          next: (res) => {
            this.restoring.set(false);
            this.results.set(res.data);
            const ok = res.data.filter((r) => r.status === "success").length;
            const errs = res.data.filter((r) => r.status === "error").length;
            if (errs > 0) {
              this.snackBar.open(`${ok} restauradas, ${errs} errores`, "Cerrar", { duration: 5000 });
            } else {
              this.snackBar.open(`${ok} entidades restauradas exitosamente`, "Cerrar", { duration: 4000 });
            }
            this.loadEntities();
          },
          error: (err) => {
            this.restoring.set(false);
            this.error.set(err.error?.message || err.message || "Error al restaurar");
          },
        });
      });
  }
}
