import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { SweetAlertService } from "@core/services/sweet-alert.service";
import {
  ImportarExcelService,
  PreviewResponse,
  ColumnMapping,
  RowValidation,
  RowAction,
} from "./importar-excel.service";
import { CollapsibleSectionComponent } from "@shared/collapsible-section/collapsible-section.component";

interface StepInfo {
  label: string;
  icon: string;
}

@Component({
  selector: "app-importar-excel",
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatSlideToggleModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule,
    CollapsibleSectionComponent,
  ],
  template: `
  <div class="import-page">
    <header class="import-head">
      <p class="simr-eyebrow">Utilidades</p>
      <h1 class="import-title">Importación de Datos desde Excel</h1>
    </header>

    <div class="step-indicator">
      @for (s of steps; track $index) {
        <div class="step-item" [class.active]="step() === $index" [class.completed]="stepStatus()[$index] === 'completed'">
          <div class="step-circle">
            @if (stepStatus()[$index] === 'completed') {
              <mat-icon>check</mat-icon>
            } @else {
              <span>{{ $index + 1 }}</span>
            }
          </div>
          <span class="step-label">{{ s.label }}</span>
        </div>
        @if ($index < steps.length - 1) {
          <div class="step-line" [class.completed]="stepStatus()[$index] === 'completed'"></div>
        }
      }
    </div>

    @if (error()) {
      <div class="import-error">
        <mat-icon>error_outline</mat-icon> {{ error() }}
      </div>
    }

    <!-- STEP 1: Cargar archivo -->
    @if (step() === 0) {
      <mat-card appearance="outlined" class="step-card">
        <div class="upload-zone"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             [class.dragging]="isDragging()"
             [class.has-file]="file() !== null">
          <input #fileInput type="file" accept=".xlsx" (change)="onFileSelected($event)" hidden />
          @if (!file()) {
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p class="upload-text">Arrastra un archivo .xlsx aquí o</p>
            <button mat-flat-button color="primary" (click)="fileInput.click()">Seleccionar archivo</button>
          } @else {
            <mat-icon class="upload-icon" style="color: var(--simr-musgo)">insert_drive_file</mat-icon>
            <p class="upload-text">{{ file()!.name }}</p>
            <p class="upload-size">{{ formatFileSize(file()!.size) }}</p>
            <button mat-stroked-button (click)="removeFile()">Quitar archivo</button>
          }
        </div>
        @if (preview()) {
          <mat-divider></mat-divider>
          <div class="preview-section">
            <h3>Vista previa primeras filas</h3>
            <div class="table-wrap">
              <table class="preview-table">
                <thead>
                  <tr><th>#</th>@for (col of preview()!.columns; track $index) {
                    <th>{{ col }}</th>
                  }</tr>
                </thead>
                <tbody>
                  @for (row of preview()!.previewRows; track $index) {
                    <tr><td class="row-num">{{ $index + 1 }}</td>@for (cell of row; track $index) {
                      <td>{{ cell }}</td>
                    }</tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="total-rows">{{ preview()!.totalRows }} filas encontradas</p>
          </div>
        }
        <div class="step-actions">
          <button mat-flat-button color="primary" [disabled]="!file() || loading()" (click)="cargarArchivo()">
            @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
            Siguiente
          </button>
        </div>
      </mat-card>
    }

    <!-- STEP 2: Mapeo de columnas -->
    @if (step() === 1) {
      <div class="mapping-layout">
        <mat-card appearance="outlined" class="step-card entity-panel">
          <h3>Estructura SIMR</h3>
          @for (entity of entities(); track entity.name) {
            <app-collapsible-section [title]="entity.label" [collapsed]="true">
              <div class="field-list">
                @for (f of entity.fields; track f.name) {
                  <div class="field-item" (click)="selectField(entity.name, f.name, f.label)">
                    <span class="field-name">{{ f.label }}</span>
                    <span class="field-key">{{ f.name }}</span>
                    @if (f.main) { <span class="field-badge">principal</span> }
                  </div>
                }
              </div>
            </app-collapsible-section>
          }
        </mat-card>

        <mat-card appearance="outlined" class="step-card columns-panel">
          <h3>Columnas del archivo</h3>
          @if (unmappedColumns().length > 0 && mappings().length > 0) {
            <div class="warning-banner">
              <mat-icon>warning_amber</mat-icon>
              <span>{{ unmappedColumns().length }} columna(s) sin correspondencia — se importarán como Descriptores</span>
            </div>
          }
          <div class="column-mappings">
            @for (m of mappings(); track m.columnIndex) {
              <div class="mapping-row" [class.ignored]="m.ignore">
                <div class="mapping-col-name">
                  <strong>{{ m.columnName }}</strong>
                  @if (m.confidence >= 80) {
                    <span class="conf-badge high" matTooltip="Alta confianza">👍</span>
                  } @else if (m.confidence >= 50) {
                    <span class="conf-badge mid" matTooltip="Confianza media">⚠️</span>
                  }
                </div>
                <mat-form-field appearance="outline" class="campo mapping-select">
                  <mat-label>Campo SIMR</mat-label>
                  <mat-select [(ngModel)]="m.entity" (ngModelChange)="onMappingChange(m)" [disabled]="m.ignore">
                    <mat-option [value]="null">— Ignorar —</mat-option>
                    @for (e of entities(); track e.name) {
                      <mat-optgroup [label]="e.label">
                        @for (f of e.fields; track f.name) {
                          <mat-option [value]="e.name + ':' + f.name">
                            {{ e.label }} › {{ f.label }}
                          </mat-option>
                        }
                      </mat-optgroup>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-checkbox [(ngModel)]="m.ignore" (ngModelChange)="onMappingChange(m)">Ignorar</mat-checkbox>
              </div>
              <div class="mapping-descriptor-row" *ngIf="!m.entity && !m.ignore">
                <mat-slide-toggle [(ngModel)]="m.asDescriptor" color="primary">Importar como Descriptor</mat-slide-toggle>
                @if (m.asDescriptor) {
                  <mat-form-field appearance="outline" class="campo descriptor-key">
                    <mat-label>Clave del descriptor</mat-label>
                    <input matInput [(ngModel)]="m.descriptorKey" placeholder="ej. origen" />
                  </mat-form-field>
                }
              </div>
            }
          </div>
          <div class="step-actions">
            <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(0)">← Volver</button>
            <button mat-flat-button color="primary" [disabled]="!hasAnyMapping()" (click)="irAValidar()">Siguiente</button>
          </div>
        </mat-card>
      </div>
    }

    <!-- STEP 3: Validación y deduplicación -->
    @if (step() === 2) {
      <mat-card appearance="outlined" class="step-card">
        <div class="summary-bar">
          <span class="summary-item" style="color: var(--simr-musgo)">
            <strong>{{ step3New() }}</strong> nuevos
          </span>
          <span class="summary-item" style="color: var(--simr-cobre)">
            <strong>{{ step3Update() }}</strong> existentes (para actualizar)
          </span>
          <span class="summary-item" style="color: var(--simr-tinta-2)">
            <strong>{{ step3Skipped() }}</strong> omitidos
          </span>
        </div>
        <div class="table-wrap">
          <table class="validation-table">
            <thead>
              <tr>
                <th><mat-checkbox (change)="toggleAllRows($event.checked)" [checked]="allSelected()" [indeterminate]="someSelected()"></mat-checkbox></th>
                @for (col of preview()?.columns; track $index) {
                  <th>{{ col }}</th>
                }
                <th>Coincidencia</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (v of validationResults(); track v.rowIndex) {
                <tr [class.match-row]="v.matchFound" [class.omit-row]="!v.selected">
                  <td><mat-checkbox [(ngModel)]="v.selected"></mat-checkbox></td>
                  @for (cell of v.data; track $index) {
                    <td>{{ cell }}</td>
                  }
                  <td>
                    @if (v.matchFound) {
                      <span class="match-link" (click)="abrirDetalle(v)">{{ v.matchTitle }}</span>
                    } @else {
                      <span class="no-match">—</span>
                    }
                  </td>
                  <td>
                    <mat-form-field appearance="outline" class="campo action-select">
                      <mat-select [(ngModel)]="v.suggestedAction" [disabled]="!v.selected">
                        <mat-option value="create">Crear nuevo</mat-option>
                        <mat-option value="update" [disabled]="!v.matchFound">Actualizar existente</mat-option>
                        <mat-option value="skip">Omitir</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="step-actions">
          <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(1)">← Volver</button>
          <button mat-flat-button color="primary" [disabled]="!anySelected()" (click)="irAConfirmar()">
            Siguiente
          </button>
        </div>
      </mat-card>
    }

    <!-- STEP 4: Confirmación y escritura -->
    @if (step() === 3) {
      <mat-card appearance="outlined" class="step-card">
        <div class="final-summary">
          <div class="summary-stat" style="background: rgba(92, 122, 90, 0.1); border-color: var(--simr-musgo)">
            <span class="stat-num">{{ finalNew() }}</span>
            <span class="stat-label">Nuevos</span>
          </div>
          <div class="summary-stat" style="background: rgba(200, 119, 46, 0.1); border-color: var(--simr-cobre)">
            <span class="stat-num">{{ finalUpdate() }}</span>
            <span class="stat-label">A Actualizar</span>
          </div>
          <div class="summary-stat" style="background: rgba(31, 42, 36, 0.05); border-color: var(--mat-sys-outline)">
            <span class="stat-num">{{ finalSkip() }}</span>
            <span class="stat-label">Omitidos</span>
          </div>
        </div>

        @if (!executed()) {
          <div class="step-actions">
            <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(2)">← Volver a validar</button>
            <button mat-flat-button color="primary" [disabled]="executing()" (click)="ejecutarImportacion()" class="btn-execute">
              @if (executing()) { <mat-spinner diameter="20"></mat-spinner> }
              Confirmar e importar
            </button>
          </div>
        }

        @if (executed() || importLog().length > 0) {
          <mat-divider style="margin: 1.5rem 0"></mat-divider>
          <h3>Registro de importación</h3>
          <div class="log-panel">
            @for (entry of importLog(); track $index) {
              <div class="log-entry" [class.log-error]="entry.status === 'error'"
                   [class.log-warning]="entry.status === 'warning'"
                   [class.log-skipped]="entry.status === 'skipped'">
                <span class="log-icon">
                  @if (entry.status === 'success') { ✅ }
                  @if (entry.status === 'warning') { ⚠️ }
                  @if (entry.status === 'error') { ❌ }
                  @if (entry.status === 'skipped') { ⏭️ }
                </span>
                <span class="log-msg">{{ entry.message }}</span>
              </div>
            }
          </div>
          @if (executed() && !executing()) {
            <div class="step-actions">
              <a mat-stroked-button routerLink="/admin/importar-excel">Nueva importación</a>
            </div>
          }
        }
      </mat-card>
    }
  </div>
  `,
  styles: [`
    .import-page { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .import-head { margin-bottom: 2rem; }
    .import-title { font-family: var(--simr-display); color: var(--simr-tinta); margin: 0.25rem 0 0; font-size: 1.75rem; font-weight: 500; }
    .step-indicator { display: flex; align-items: center; margin-bottom: 2rem; gap: 0; }
    .step-item { display: flex; align-items: center; gap: 0.5rem; }
    .step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; border: 2px solid var(--mat-sys-outline); color: var(--simr-tinta-2); background: var(--simr-hueso); transition: all 0.2s; }
    .step-circle mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .step-item.active .step-circle { background: var(--simr-sello); border-color: var(--simr-sello); color: #fff; }
    .step-item.completed .step-circle { background: var(--simr-musgo); border-color: var(--simr-musgo); color: #fff; }
    .step-label { font-size: 0.85rem; color: var(--simr-tinta-2); white-space: nowrap; }
    .step-item.active .step-label { color: var(--simr-sello); font-weight: 600; }
    .step-item.completed .step-label { color: var(--simr-musgo); }
    .step-line { flex: 1; height: 2px; background: var(--mat-sys-outline); margin: 0 1rem; min-width: 32px; }
    .step-line.completed { background: var(--simr-musgo); }
    .step-card { padding: 2rem; border-radius: 14px; background: var(--simr-hueso); }
    .step-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--mat-sys-outline-variant); }
    .import-error { background: rgba(181, 67, 42, 0.08); color: var(--simr-sello); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }

    .upload-zone { border: 2px dashed var(--mat-sys-outline); border-radius: 12px; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--simr-hueso); }
    .upload-zone.dragging { border-color: var(--simr-sello); background: rgba(181, 67, 42, 0.04); }
    .upload-zone.has-file { border-style: solid; border-color: var(--simr-musgo); }
    .upload-icon { font-size: 3rem; width: 3rem; height: 3rem; color: var(--mat-sys-outline); margin-bottom: 0.5rem; }
    .upload-text { color: var(--simr-tinta-2); margin: 0.5rem 0; }
    .upload-size { color: var(--simr-tinta-2); font-size: 0.85rem; opacity: 0.7; }

    .preview-section { margin-top: 1.5rem; }
    .preview-section h3 { font-family: var(--simr-display); color: var(--simr-tinta); margin: 0 0 0.75rem; font-size: 1rem; }
    .table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); }
    .preview-table, .validation-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .preview-table th, .validation-table th { background: var(--simr-papel); padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; color: var(--simr-tinta-2); border-bottom: 1px solid var(--mat-sys-outline-variant); white-space: nowrap; }
    .preview-table td, .validation-table td { padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--mat-sys-outline-variant); color: var(--simr-tinta); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .preview-table .row-num { color: var(--simr-tinta-2); opacity: 0.6; width: 2rem; text-align: center; }
    .total-rows { color: var(--simr-tinta-2); font-size: 0.85rem; margin-top: 0.5rem; }

    .mapping-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; align-items: start; }
    .entity-panel h3, .columns-panel h3 { font-family: var(--simr-display); color: var(--simr-tinta); margin: 0 0 1rem; font-size: 1.1rem; }
    .field-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .field-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
    .field-item:hover { background: rgba(200, 119, 46, 0.08); }
    .field-name { font-weight: 500; color: var(--simr-tinta); }
    .field-key { font-family: var(--simr-mono); font-size: 0.75rem; color: var(--simr-tinta-2); opacity: 0.6; }
    .field-badge { font-size: 0.65rem; background: var(--simr-musgo); color: #fff; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: auto; }
    .warning-banner { display: flex; align-items: center; gap: 0.5rem; background: rgba(200, 119, 46, 0.1); border-left: 3px solid var(--simr-cobre); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .column-mappings { display: flex; flex-direction: column; gap: 0.75rem; }
    .mapping-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.5rem; border-radius: 8px; background: var(--simr-papel); transition: opacity 0.2s; }
    .mapping-row.ignored { opacity: 0.5; }
    .mapping-col-name { min-width: 140px; display: flex; align-items: center; gap: 0.25rem; }
    .mapping-col-name strong { font-size: 0.9rem; color: var(--simr-tinta); }
    .conf-badge { font-size: 0.85rem; }
    .mapping-select { flex: 1; min-width: 200px; }
    .mapping-descriptor-row { display: flex; align-items: center; gap: 1rem; padding: 0.25rem 0.5rem 0.5rem; flex-wrap: wrap; }
    .descriptor-key { flex: 1; min-width: 160px; }

    .summary-bar { display: flex; gap: 1.5rem; margin-bottom: 1rem; padding: 0.75rem 1rem; background: var(--simr-papel); border-radius: 8px; font-size: 0.9rem; }
    .summary-item { display: flex; gap: 0.25rem; }
    .validation-table td { max-width: 150px; }
    .match-row { background: rgba(92, 122, 90, 0.04); }
    .omit-row { opacity: 0.5; }
    .no-match { color: var(--simr-tinta-2); opacity: 0.5; font-style: italic; }
    .match-link { color: var(--simr-cobre); text-decoration: underline; cursor: pointer; font-size: 0.85rem; }
    .action-select { min-width: 160px; }

    .final-summary { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .summary-stat { flex: 1; border: 1px solid; border-radius: 10px; padding: 1.25rem; text-align: center; }
    .stat-num { display: block; font-size: 2rem; font-weight: 700; font-family: var(--simr-display); color: var(--simr-tinta); }
    .stat-label { font-size: 0.85rem; color: var(--simr-tinta-2); }

    .log-panel { max-height: 400px; overflow-y: auto; border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; padding: 0.5rem; }
    .log-entry { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
    .log-entry:hover { background: var(--simr-papel); }
    .log-entry.log-error { background: rgba(181, 67, 42, 0.06); }
    .log-entry.log-warning { background: rgba(200, 119, 46, 0.06); }
    .log-entry.log-skipped { opacity: 0.6; }
    .log-icon { font-size: 1rem; }
    .log-msg { color: var(--simr-tinta); }
    .btn-execute { background: var(--simr-musgo) !important; }

    @media (max-width: 800px) {
      .mapping-layout { grid-template-columns: 1fr; }
      .mapping-row { flex-direction: column; align-items: stretch; }
      .mapping-col-name { min-width: auto; }
      .mapping-select { min-width: auto; }
    }
  `],
})
export class ImportarExcelComponent implements OnInit {
  private readonly service = inject(ImportarExcelService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sweetAlert = inject(SweetAlertService);
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  readonly steps: StepInfo[] = [
    { label: "Cargar", icon: "cloud_upload" },
    { label: "Mapear", icon: "swap_horiz" },
    { label: "Validar", icon: "fact_check" },
    { label: "Importar", icon: "file_download" },
  ];

  step = signal(0);
  stepStatus = signal<("pending" | "active" | "completed")[]>(["active", "pending", "pending", "pending"]);
  file = signal<File | null>(null);
  preview = signal<PreviewResponse | null>(null);
  entities = computed(() => this.preview()?.entities ?? []);
  mappings = signal<ColumnMapping[]>([]);
  validationResults = signal<RowValidation[]>([]);
  importLog = signal<{ rowIndex: number; status: string; message: string }[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  isDragging = signal(false);
  executing = signal(false);
  executed = signal(false);

  unmappedColumns = computed(() => this.mappings().filter((m) => !m.entity && !m.ignore));
  hasAnyMapping = computed(() => this.mappings().some((m) => m.entity && !m.ignore));
  allSelected = computed(() => this.validationResults().length > 0 && this.validationResults().every((r) => r.selected));
  someSelected = computed(() => this.validationResults().some((r) => r.selected));
  anySelected = computed(() => this.validationResults().some((r) => r.selected));
  step3New = computed(() => this.validationResults().filter((r) => r.suggestedAction === "create" && r.selected).length);
  step3Update = computed(() => this.validationResults().filter((r) => r.suggestedAction === "update" && r.selected).length);
  step3Skipped = computed(() => this.validationResults().filter((r) => !r.selected).length);
  finalNew = computed(() => this.validationResults().filter((r) => r.selected && r.suggestedAction === "create").length);
  finalUpdate = computed(() => this.validationResults().filter((r) => r.selected && r.suggestedAction === "update").length);
  finalSkip = computed(() => this.validationResults().filter((r) => !r.selected || r.suggestedAction === "skip").length);

  ngOnInit() {
    this.stepStatus.set(["active", "pending", "pending", "pending"]);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setFile(files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setFile(input.files[0]);
    }
  }

  private setFile(f: File) {
    if (!f.name.endsWith(".xlsx")) {
      this.error.set("Solo se admiten archivos .xlsx");
      return;
    }
    this.error.set(null);
    this.file.set(f);
  }

  removeFile() {
    this.file.set(null);
    this.preview.set(null);
    this.error.set(null);
    if (this.fileInput) this.fileInput.nativeElement.value = "";
  }

  cargarArchivo() {
    const f = this.file();
    if (!f) return;
    this.loading.set(true);
    this.error.set(null);
    this.service.preview(f).subscribe({
      next: (res) => {
        this.preview.set(res.data);
        this.buildInitialMappings(res.data);
        this.loading.set(false);
        this.advanceStep();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || "Error al procesar el archivo");
      },
    });
  }

  private buildInitialMappings(data: PreviewResponse) {
    this.mappings.set(
      data.columns.map((col, i) => {
        const auto = data.autoMap[i];
        const best = auto?.bestMatch;
        return {
          columnIndex: i,
          columnName: col,
          entity: best ? best.entity : null,
          field: best ? best.field : null,
          confidence: best ? best.confidence : 0,
          ignore: false,
          asDescriptor: !best,
          descriptorKey: col,
        };
      })
    );
  }

  onMappingChange(m: ColumnMapping) {
    if (m.ignore) {
      m.entity = null;
      m.field = null;
    } else if (m.entity && m.entity.includes(":")) {
      const parts = m.entity.split(":");
      m.entity = parts[0];
      m.field = parts[1];
    }
  }

  selectField(entityName: string, fieldName: string, fieldLabel: string) {
    const firstUnmapped = this.mappings().find((m) => !m.entity && !m.ignore);
    if (firstUnmapped) {
      firstUnmapped.entity = entityName;
      firstUnmapped.field = fieldName;
      firstUnmapped.confidence = 100;
      this.mappings.set([...this.mappings()]);
    }
  }

  irAValidar() {
    if (!this.anySelected) return;
    this.loading.set(true);
    this.error.set(null);
    const preview = this.preview();
    if (!preview) return;
    this.service.dedup({
      columns: preview.columns,
      rows: preview.previewRows,
      mappings: this.mappings(),
    }).subscribe({
      next: (res) => {
        this.validationResults.set(res.data);
        this.loading.set(false);
        this.advanceStep();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || "Error al validar datos");
      },
    });
  }

  toggleAllRows(checked: boolean) {
    this.validationResults.update((list) => list.map((r) => ({ ...r, selected: checked })));
  }

  irAConfirmar() {
    const selected = this.validationResults().filter((r) => r.selected);
    if (selected.length === 0) {
      this.sweetAlert.confirm(
        "¿Ninguna fila seleccionada para importar?",
        "No hay filas marcadas para importar. ¿Deseas continuar de todas formas?",
        "Sí, continuar",
        "Volver"
      ).then((result: any) => { if (result.isConfirmed) this.advanceStep(); });
    } else {
      this.advanceStep();
    }
  }

  async ejecutarImportacion() {
    this.executing.set(true);
    this.error.set(null);
    const preview = this.preview();
    if (!preview) return;
    const actions: RowAction[] = this.validationResults()
      .filter((r) => r.selected)
      .map((r) => ({
        rowIndex: r.rowIndex,
        rowAction: r.suggestedAction,
        matchId: r.matchId,
      }));

    this.service.execute({
      columns: preview.columns,
      rows: preview.previewRows,
      mappings: this.mappings(),
      actions,
    }).subscribe({
      next: (res) => {
        this.importLog.set(
          res.data.results.map((r) => ({
            rowIndex: r.rowIndex,
            status: r.status,
            message: r.message,
          }))
        );
        this.executing.set(false);
        this.executed.set(true);
        const s = res.data.summary;
        if (s.errors > 0) {
          this.snackBar.open(`${s.created} importados, ${s.errors} errores`, "Cerrar", { duration: 5000 });
        } else {
          this.snackBar.open(`${s.created} registros importados exitosamente`, "Cerrar", { duration: 4000 });
        }
      },
      error: (err) => {
        this.executing.set(false);
        const msg = err.error?.message || err.message || "Error al ejecutar la importación";
        this.importLog.update((log) => [...log, { rowIndex: -1, status: "error", message: msg }]);
        this.error.set(msg);
      },
    });
  }

  abrirDetalle(v: RowValidation) {
    if (v.matchId) {
      const entity = this.mappings().find((m) => !m.ignore && m.entity)?.entity?.toLowerCase() || "";
      const routes: Record<string, string> = {
        obra: "/obras", actor: "/actores", recurso: "/recursos",
        instrumento: "/instrumentos", sistema: "/sistemas", medio: "/medios",
        genero: "/generos", generonomusical: "/generos-no-musicales",
        materia: "/materias", fondo: "/fondos", coleccion: "/colecciones",
        proyecto: "/proyectos", idioma: "/idiomas", ejemplar: "/ejemplares",
        diccionario: "/diccionarios",
      };
      const base = routes[entity] || `/${entity}`;
      window.open(`#${base}/${v.matchId}`, "_blank");
    }
  }

  private advanceStep() {
    const s = this.step();
    const next = Math.min(s + 1, 3);
    this.step.set(next);
    const status = [...this.stepStatus()];
    status[s] = "completed";
    status[next] = "active";
    this.stepStatus.set(status);
  }
}
