import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
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
import { MatMenuModule } from "@angular/material/menu";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { SweetAlertService } from "@core/services/sweet-alert.service";
import {
  ImportarExcelService,
  PreviewResponse,
  ColumnMapping,
  RowValidation,
  RowAction,
  RefSearchAllResult,
  RefMatchItem,
  RefResolution,
  EntityImportConfig,
  AutoLinkConfig,
  CompoundObjectGroup,
  CompoundRefGroup,
  EntityField,
  FixedDescriptor,
  ExecuteEntityPayload,
  ImportResult,
} from "./importar-excel.service";
import { CollapsibleSectionComponent } from "@shared/collapsible-section/collapsible-section.component";

interface StepInfo {
  label: string;
  icon: string;
}

export interface ValidationColumn {
  kind: "field" | "sub";
  key: string;
  entityName: string;
  field: string;
  subField?: string;
  groupKind?: "object" | "ref";
  groupId?: string;
  label: string;
}

@Component({
  selector: "app-importar-excel",
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatSlideToggleModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule, MatMenuModule, MatAutocompleteModule,
    CollapsibleSectionComponent,
  ],
  template: `
  <div class="import-page">
    <header class="import-head">
      <p class="simr-eyebrow">Administración</p>
      <h1 class="import-title">Importación de Datos desde Excel</h1>
    </header>

    <div class="step-indicator">
      @for (s of steps; track $index) {
        <div class="step-item" [class.active]="step() === $index" [class.completed]="stepStatus()[$index] === 'completed'" [class.clickable]="canGoToStep($index)" (click)="goToStep($index)">
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

    <!-- STEP 0: Cargar archivo -->
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
            <div class="preview-header">
              <h3>Vista previa ({{ previewRows().length }} filas aleatorias, solo columnas con datos)</h3>
              <div class="preview-header-actions">
                @if (testMode()) {
                  <button mat-stroked-button (click)="refreshTestRows()" matTooltip="Genera un nuevo conjunto de 5 filas aleatorias de todo el archivo. Clícalo las veces que necesites.">
                    <mat-icon>refresh</mat-icon> Refrescar filas
                  </button>
                }
                <mat-slide-toggle [ngModel]="testMode()" (ngModelChange)="setTestMode($event)" color="primary">Modo prueba (5 filas)</mat-slide-toggle>
              </div>
            </div>
            @if (testMode()) {
              <div class="test-banner">
                <mat-icon>science</mat-icon> Modo prueba activo: se procesarán máximo 5 filas seleccionadas aleatoriamente. Desactívalo para importar todo el archivo.
              </div>
            }
            <div class="table-wrap">
              <table class="preview-table">
                <thead>
                  <tr><th>#</th>@for (col of previewColumns(); track $index) {
                    <th [matTooltip]="col.name"><span class="col-head">{{ col.name }}</span></th>
                  }</tr>
                </thead>
                <tbody>
                  @for (row of previewRows(); track $index) {
                    <tr><td class="row-num">{{ $index + 1 }}</td>@for (cell of row; track $index) {
                      <td>{{ cell }}</td>
                    }</tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="total-rows">{{ preview()!.totalRows }} filas encontradas. {{ preview()!.rows.length }} filas para importar.</p>
        </div>
        }
        <div class="step-actions">
          @if (!preview() && !loading()) {
            <button mat-flat-button color="primary" [disabled]="!file()" (click)="cargarArchivo()">Analizar archivo</button>
          }
          @if (preview() && !loading()) {
            <button mat-flat-button color="primary" (click)="advanceStep()">Siguiente</button>
          }
          @if (loading()) {
            <button mat-flat-button color="primary" disabled>
              <mat-spinner diameter="20"></mat-spinner> Analizando...
            </button>
          }
        </div>
      </mat-card>
    }

    <!-- STEP 1: Seleccionar entidad(es) -->
    @if (step() === 1) {
      <mat-card appearance="outlined" class="step-card">
        <h3>Selecciona las entidades a importar</h3>
        <p class="entity-desc">Elige la entidad principal primero, luego agrega secundarias si el archivo contiene datos de varias entidades relacionadas.</p>

        <div class="entity-picker">
          <label class="picker-label">¿Qué datos contiene este archivo?</label>
          <div class="picker-grid">
            @for (e of entityInfos(); track e.name) {
              <button class="picker-card" (click)="selectPrimaryEntity(e.name)">
                <strong>{{ e.label }}</strong>
                <span class="picker-meta">{{ e.fields.length }} campos</span>
              </button>
            }
          </div>
        </div>

        @if (importEntities().length > 0) {
          <div class="entity-list">
            @for (ec of importEntities(); track ec.entityName; let i = $index) {
              <div class="entity-list-item" [class.primary]="i === 0">
                <div class="entity-badge" [class.primary-badge]="i === 0">
                  <mat-icon>{{ i === 0 ? 'star' : 'layers' }}</mat-icon>
                </div>
                <div class="entity-info">
                  <strong>{{ ec.label }} @if (i === 0) { <span class="primary-tag">principal</span> }</strong>
                  <span class="entity-meta">{{ ec.fields.length }} campos</span>
                  @if (ec.autoLinks && ec.autoLinks.length > 0) {
                    <div class="auto-link-chips">
                      @for (l of ec.autoLinks; track l.field) {
                        <span class="link-chip">{{ getEntityLabel(l.parentEntity) }} · {{ l.field }} {{ l.reverse ? '←' : '→' }}</span>
                      }
                    </div>
                  }
                </div>
                <button mat-icon-button color="warn" matTooltip="Quitar entidad" [disabled]="i === 0" (click)="removeEntity(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>

          @if (showAddEntity()) {
            <div class="add-entity-panel">
              <mat-form-field appearance="outline" class="entity-select">
                <mat-label>Entidad subsidiaria</mat-label>
                <mat-select [ngModel]="newSecondaryEntityName()" (ngModelChange)="newSecondaryEntityName.set($event); onSecondaryEntityChange()">
                  @for (e of availableSecondaryEntities(); track e.name) {
                    <mat-option [value]="e.name">{{ e.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              @if (newSecondaryEntityName(); as en) {
                @if (getAutoLinkCandidates(en); as candidates) {
                  @if (candidates.length === 0) {
                    <p class="no-links">Esta entidad no tiene campos de relación con las entidades seleccionadas. Se importará de forma independiente.</p>
                  } @else {
                    <div class="auto-link-config">
                      <p class="link-desc">¿Cómo se relaciona con las demás entidades? Elige el campo común y su sentido.</p>
                      @for (c of candidates; track c.field + '_' + c.reverse) {
                        <mat-checkbox [checked]="selectedAutoLinks()[c.field + '_' + c.reverse] || false"
                                      (change)="toggleAutoLink(en, c, $event.checked)">
                          <span class="link-option-text">{{ getEntityLabel(c.parentEntity) }} ← <code>{{ c.field }}</code> {{ c.reverse ? '(inverso)' : '' }}</span>
                        </mat-checkbox>
                      }
                    </div>
                  }
                }
              }
              <div class="add-panel-actions">
                <button mat-stroked-button (click)="showAddEntity.set(false)">Cancelar</button>
                <button mat-flat-button color="primary"
                        [disabled]="!newSecondaryEntityName() || !hasValidAutoLink(newSecondaryEntityName()!)"
                        (click)="addSecondaryEntity()">Agregar entidad</button>
              </div>
            </div>
          }
          <button mat-stroked-button class="add-entity-btn" (click)="showAddEntity.set(!showAddEntity())">
            <mat-icon>add</mat-icon> Agregar entidad subsidiaria
          </button>
        }

        <div class="step-actions">
          <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(0)">← Volver</button>
          <button mat-flat-button color="primary" [disabled]="!entitiesSelected()" (click)="advanceStep()">Siguiente</button>
        </div>
      </mat-card>
    }

    <!-- STEP 2: Mapeo de columnas -->
    @if (step() === 2) {
      <mat-card appearance="outlined" class="step-card">
        <div class="entity-tabs">
          @for (ec of importEntities(); track ec.entityName; let i = $index) {
            <button class="entity-tab" [class.active]="activeEntityIndex() === i" (click)="activeEntityIndex.set(i)">
              <mat-icon>{{ i === 0 ? 'star' : 'layers' }}</mat-icon>
              {{ ec.label }}
              <span class="tab-count">{{ countMapped(ec.mappings) }}/{{ ec.fields.length }}</span>
            </button>
          }
        </div>

        <div class="mapping-form-header">
          <h3>Mapear columnas a {{ activeEntityLabel() }}</h3>
          <p class="form-desc">Asigna una o varias columnas por campo, o escribe un valor fijo. Los subcampos y los campos de la relación se configuran dentro de cada campo.</p>
        </div>

        <div class="mapping-form">
          <ng-template #fieldCard let-f="f">
            <div class="field-card" [class.field-card-mapped]="getFieldColumnIndices(f.name).length > 0 || !!getFieldConstant(f.name)">
              <div class="field-card-header">
                <span class="field-label">{{ f.label }}</span>
                @if (f.main) { <span class="badge badge-main">principal</span> }
                @if (f.isRef) { <span class="badge badge-ref">{{ f.refDisplayLabel }}</span> }
                @if (f.isCompoundObject) { <span class="badge badge-compound">subcampos</span> }
                @if (f.companionFields && f.companionFields.length > 0) { <span class="badge badge-companion">relación</span> }
                <span class="header-spacer"></span>
                @if (f.isRef || f.isCompoundObject) {
                  <mat-form-field appearance="outline" class="campo delimiter-input">
                    <mat-label>Separador</mat-label>
                    <input matInput [ngModel]="getFieldDelimiter(f.name) || ''" (ngModelChange)="setFieldDelimiter(f.name, $event)" placeholder="ej. |" matTooltip="Si la celda contiene varios valores separados por un carácter, indícalo aquí (ej. |)" />
                  </mat-form-field>
                }
              </div>

              <div class="field-card-body">
                @if (getFieldConstant(f.name)) {
                  <div class="constant-hint">
                    <mat-icon>tune</mat-icon>
                    Este campo usará el valor fijo — borra el texto para volver a mapear columnas.
                  </div>
                } @else if (!isCompoundField(f)) {
                  <div class="chips-row">
                    @for (ci of getFieldColumnIndices(f.name); track ci) {
                      <span class="column-chip" [matTooltip]="getColumnName(ci)">
                        <span class="chip-name">{{ getColumnName(ci) }}</span>
                        <button mat-icon-button matTooltip="Quitar columna" (click)="removeFieldColumn(f.name, ci)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </span>
                    }
                    <mat-form-field appearance="outline" class="column-search-input">
                      <mat-label>+ Columna</mat-label>
                      <input matInput [matAutocomplete]="colAuto" [ngModel]="fieldColumnSearch()[f.name] || ''" (ngModelChange)="setFieldColumnSearch(f.name, $event)" placeholder="buscar por nombre..." />
                    </mat-form-field>
                    <mat-autocomplete #colAuto="matAutocomplete" (optionSelected)="onFieldColumnPicked(f.name, $event.option.value)">
                      @for (col of filteredFieldColumns(f.name); track col.index) {
                        <mat-option [value]="col.index">
                          <div class="col-option">
                            <span class="col-option-name" [matTooltip]="col.name">{{ col.name }}</span>
                            @if (getColumnExample(col.index); as ex) {
                              <small class="col-option-example">ej: {{ ex }}</small>
                            }
                          </div>
                        </mat-option>
                      }
                    </mat-autocomplete>
                  </div>
                }
                @if (!f.isRef && !f.isCompoundObject) {
                  <mat-form-field appearance="outline" class="constant-input">
                    <mat-label>Valor fijo</mat-label>
                    @if (f.list) {
                      <input matInput [matAutocomplete]="constAuto" [ngModel]="getFieldConstant(f.name) || ''" (ngModelChange)="setFieldConstant(f.name, $event)" placeholder="elige de la lista {{ f.list }}..." />
                      <mat-autocomplete #constAuto="matAutocomplete">
                        @for (opt of filteredLista(f.list, getFieldConstant(f.name) || ''); track opt) {
                          <mat-option [value]="opt">{{ opt }}</mat-option>
                        }
                      </mat-autocomplete>
                    } @else {
                      <input matInput [ngModel]="getFieldConstant(f.name) || ''" (ngModelChange)="setFieldConstant(f.name, $event)" placeholder="opcional — reemplaza la columna" />
                    }
                  </mat-form-field>
                }
              </div>

              @if (f.companionFields && f.companionFields.length > 0) {
                <div class="companions-row">
                  <span class="companions-label">Campos de la relación</span>
                  @for (cf of f.companionFields; track cf.name) {
                    <div class="companion-item">
                      <span class="companion-name">{{ cf.label }}</span>
                      <mat-form-field appearance="outline" class="companion-column-select">
                        <mat-label>Columna</mat-label>
                        <mat-select [ngModel]="getCompanionColumn(f.name, cf.name)" (ngModelChange)="setCompanionColumn(f.name, cf.name, $event)">
                          <mat-option [value]="null">—</mat-option>
                          @for (col of previewColumns(); track col.index) {
                            <mat-option [value]="col.index">{{ col.name }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="companion-constant-input">
                        <mat-label>o fijo</mat-label>
                        @if (cf.list) {
                          <input matInput [matAutocomplete]="companionConstAuto" [ngModel]="getCompanionConstant(f.name, cf.name) || ''" (ngModelChange)="setCompanionConstant(f.name, cf.name, $event)" placeholder="elige de la lista {{ cf.list }}..." />
                          <mat-autocomplete #companionConstAuto="matAutocomplete">
                            @for (opt of filteredLista(cf.list, getCompanionConstant(f.name, cf.name) || ''); track opt) {
                              <mat-option [value]="opt">{{ opt }}</mat-option>
                            }
                          </mat-autocomplete>
                        } @else {
                          <input matInput [ngModel]="getCompanionConstant(f.name, cf.name) || ''" (ngModelChange)="setCompanionConstant(f.name, cf.name, $event)" />
                        }
                      </mat-form-field>
                    </div>
                  }
                </div>
              }

              @if (f.isRef && f.subFields && f.subFields.length > 0) {
                <div class="compound-section">
                  <div class="compound-section-header">
                    <span class="compound-title">Subcampos — crear {{ f.refDisplayLabel }} desde esta fila</span>
                    <button mat-stroked-button color="primary" (click)="addCompoundGroup(f.name)">+ Agregar grupo</button>
                  </div>
                  @if (getGroupsForField(f.name); as groups) {
                    @if (groups.length === 0) {
                      <p class="no-groups-msg">Sin grupos. Usa "+ Agregar grupo" para mapear las columnas del {{ f.refDisplayLabel }}.</p>
                    }
                    @for (grp of groups; track grp.id; let gi = $index) {
                      <div class="compound-group-card">
                        <div class="compound-group-card-header">
                          <strong>Grupo {{ gi + 1 }}</strong>
                          <div class="group-card-controls">
                            @if (f.subFields.some((sf) => sf.name === 'rol')) {
                              <mat-form-field appearance="outline" class="campo ref-rol-input">
                                <mat-label>Rol</mat-label>
                                <input matInput [ngModel]="grp.refRol || ''" (ngModelChange)="setGroupRol(grp, $event)" [matAutocomplete]="autoRol" />
                              </mat-form-field>
                            }
                            <button mat-icon-button color="warn" matTooltip="Eliminar grupo" (click)="removeCompoundGroupForField(f.name, gi)">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </div>
                        @for (sf of f.subFields; track sf.name) {
                          @if (sf.name !== 'rol') {
                            <div class="sub-field-row">
                              <span class="sub-field-label" [matTooltip]="sf.entryField ? 'Se guarda en la relación (no en el ' + f.refDisplayLabel + ')' : ''">{{ sf.label }}</span>
                              <mat-form-field appearance="outline" class="campo sub-column-select">
                                <mat-label>Columna(s)</mat-label>
                                <input matInput [value]="getGroupSubFieldsLabel(grp, sf.name)" readonly [matTooltip]="getGroupSubFieldsLabel(grp, sf.name)" />
                              </mat-form-field>
                              <button mat-icon-button [matMenuTriggerFor]="subColMenu">
                                <mat-icon>arrow_drop_down</mat-icon>
                              </button>
                              <mat-menu #subColMenu="matMenu" class="column-options-panel">
                                @for (col of previewColumns(); track col.index) {
                                  <button mat-menu-item (click)="toggleGroupSubFieldColumn(grp, sf.name, col.index, !isGroupSubFieldSelected(grp, sf.name, col.index))">
                                    <mat-icon>{{ isGroupSubFieldSelected(grp, sf.name, col.index) ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                                    {{ col.name }}
                                  </button>
                                }
                              </mat-menu>
                              <mat-form-field appearance="outline" class="sub-constant-input">
                                <mat-label>Fijo</mat-label>
                                @if (sf.list) {
                                  <input matInput [matAutocomplete]="subConstAuto" [ngModel]="getSubFieldConstant(grp, sf.name) || ''" (ngModelChange)="setSubFieldConstant(grp, sf.name, $event)" matTooltip="Valor constante para este subcampo (no lee la columna)" />
                                  <mat-autocomplete #subConstAuto="matAutocomplete">
                                    @for (opt of filteredLista(sf.list, getSubFieldConstant(grp, sf.name) || ''); track opt) {
                                      <mat-option [value]="opt">{{ opt }}</mat-option>
                                    }
                                  </mat-autocomplete>
                                } @else {
                                  <input matInput [ngModel]="getSubFieldConstant(grp, sf.name) || ''" (ngModelChange)="setSubFieldConstant(grp, sf.name, $event)" matTooltip="Valor constante para este subcampo (no lee la columna)" />
                                }
                              </mat-form-field>
                            </div>
                          }
                        }
                      </div>
                    }
                  }
                </div>
              }

              @if (f.isCompoundObject && f.subFields && f.subFields.length > 0) {
                <div class="compound-section">
                  <div class="compound-section-header">
                    <span class="compound-title">Subcampos de {{ f.label }}</span>
                    <button mat-stroked-button color="primary" (click)="addCompoundObjectGroup(f.name)">+ Agregar bloque</button>
                  </div>
                  @if (getCompoundGroupsForField(f.name); as cogroups) {
                    @if (cogroups.length === 0) {
                      <p class="no-groups-msg">Sin bloques. Usa "+ Agregar bloque" para mapear los subcampos.</p>
                    }
                    @for (grp of cogroups; track grp.id; let gi = $index) {
                      <div class="compound-group-card">
                        <div class="compound-group-card-header">
                          <strong>Bloque {{ gi + 1 }}</strong>
                          <button mat-icon-button color="warn" matTooltip="Eliminar bloque" (click)="removeCompoundObjectGroup(f.name, gi)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                        @for (sf of f.subFields; track sf.name) {
                          <div class="sub-field-row">
                            <span class="sub-field-label">{{ sf.label }}</span>
                            <mat-form-field appearance="outline" class="campo sub-column-select">
                              <mat-label>Columna(s)</mat-label>
                              <input matInput [value]="getCompoundObjectSubFieldsLabel(grp, sf.name)" readonly [matTooltip]="getCompoundObjectSubFieldsLabel(grp, sf.name)" />
                            </mat-form-field>
                            <button mat-icon-button [matMenuTriggerFor]="coSubColMenu">
                              <mat-icon>arrow_drop_down</mat-icon>
                            </button>
                            <mat-menu #coSubColMenu="matMenu" class="column-options-panel">
                              @for (col of previewColumns(); track col.index) {
                                <button mat-menu-item (click)="toggleCompoundObjectSubFieldColumn(grp, sf.name, col.index, !isCompoundObjectSubFieldSelected(grp, sf.name, col.index))">
                                  <mat-icon>{{ isCompoundObjectSubFieldSelected(grp, sf.name, col.index) ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                                  {{ col.name }}
                                </button>
                              }
                            </mat-menu>
                            <mat-form-field appearance="outline" class="sub-constant-input">
                              <mat-label>Fijo</mat-label>
                              @if (sf.list) {
                                <input matInput [matAutocomplete]="coSubConstAuto" [ngModel]="getCompoundSubFieldConstant(grp, sf.name) || ''" (ngModelChange)="setCompoundSubFieldConstant(grp, sf.name, $event)" matTooltip="Valor constante para este subcampo (no lee la columna)" />
                                <mat-autocomplete #coSubConstAuto="matAutocomplete">
                                  @for (opt of filteredLista(sf.list, getCompoundSubFieldConstant(grp, sf.name) || ''); track opt) {
                                    <mat-option [value]="opt">{{ opt }}</mat-option>
                                  }
                                </mat-autocomplete>
                              } @else {
                                <input matInput [ngModel]="getCompoundSubFieldConstant(grp, sf.name) || ''" (ngModelChange)="setCompoundSubFieldConstant(grp, sf.name, $event)" matTooltip="Valor constante para este subcampo (no lee la columna)" />
                              }
                            </mat-form-field>
                          </div>
                        }
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </ng-template>
          @if (activeScalarFields().length > 0) {
            <app-collapsible-section title="Campos principales" [collapsed]="true">
              @for (f of activeScalarFields(); track f.name) {
                <ng-container *ngTemplateOutlet="fieldCard; context: { f: f }" />
              }
            </app-collapsible-section>
          }
          @if (activeRelationFields().length > 0) {
            <app-collapsible-section title="Relaciones" [collapsed]="true">
              @for (f of activeRelationFields(); track f.name) {
                <ng-container *ngTemplateOutlet="fieldCard; context: { f: f }" />
              }
            </app-collapsible-section>
          }
          @if (activeCompoundFields().length > 0) {
            <app-collapsible-section title="Bloques con subcampos" [collapsed]="true">
              @for (f of activeCompoundFields(); track f.name) {
                <ng-container *ngTemplateOutlet="fieldCard; context: { f: f }" />
              }
            </app-collapsible-section>
          }
        </div>
        <app-collapsible-section title="Descriptores libres (valores fijos)" [collapsed]="true">
          <p class="unmapped-hint">Se añadirán a todos los registros de {{ activeEntityLabel() }}. Útiles cuando el descriptor no está en ninguna columna del archivo.</p>
          @for (fd of activeFixedDescriptors(); track $index; let i = $index) {
            <div class="sub-field-row">
              <mat-form-field appearance="outline" class="campo descriptor-key-input">
                <mat-label>Etiqueta</mat-label>
                <input matInput [ngModel]="fd.etiqueta" (ngModelChange)="setFixedDescriptor(i, 'etiqueta', $event)" placeholder="Ej: Tipo de recopilación" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="campo descriptor-val-input">
                <mat-label>Valor</mat-label>
                <input matInput [ngModel]="fd.contenido" (ngModelChange)="setFixedDescriptor(i, 'contenido', $event)" placeholder="Ej: Campo" />
              </mat-form-field>
              <button mat-icon-button color="warn" matTooltip="Eliminar descriptor" (click)="removeFixedDescriptor(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
          <button mat-stroked-button (click)="addFixedDescriptor()">
            <mat-icon>add</mat-icon> Añadir descriptor fijo
          </button>
        </app-collapsible-section>
        <div class="step-actions">
          <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(1)">← Volver</button>
          <button mat-flat-button color="primary" [disabled]="!anyEntityHasMapping()" (click)="irAReferencias()">Siguiente</button>
        </div>
      </mat-card>
    }

    <!-- Autocomplete template for roles (shared) -->
    <mat-autocomplete #autoRol="matAutocomplete">
      @for (r of filteredRoles(''); track $index) {
        <mat-option [value]="r">{{ r }}</mat-option>
      }
    </mat-autocomplete>

    <!-- STEP 3: Resolver referencias (multi-entidad) -->
    @if (step() === 3) {
      <mat-card appearance="outlined" class="step-card">
        <h3>Resolver referencias</h3>
        <p class="entity-desc">Revisa las coincidencias encontradas. Cada valor único aparece una sola vez; la resolución se aplica a todas las filas con ese valor.</p>

        <div class="entity-tabs">
          @for (ec of importEntities(); track ec.entityName; let i = $index) {
            <button class="entity-tab" [class.active]="activeEntityIndex() === i" (click)="activeEntityIndex.set(i)">
              <mat-icon>{{ i === 0 ? 'star' : 'layers' }}</mat-icon>
              {{ ec.label }}
              <span class="tab-count">{{ (ec.refResults || []).length }} refs</span>
            </button>
          }
        </div>

        @if (activeRefResults().length === 0) {
          <p class="no-refs">No hay campos de referencia en {{ activeEntityLabel() }}. Continúa al siguiente paso.</p>
        }
        @for (refCol of activeRefResults(); track refCol.columnIndex) {
          @if (!isAutoLinkField(activeEntityName(), refCol.field)) {
            <app-collapsible-section [title]="refCol.displayLabel + ' (' + refCol.refEntity + ')'" [collapsed]="false">
              <div class="ref-table-wrap">
                <table class="ref-table">
                  <thead>
                    <tr>
                      <th>Valor en archivo</th>
                      <th>Filas</th>
                      <th>Acción</th>
                      <th>Coincidencia / Búsqueda</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (uv of refCol.uniqueValues; track uv.searchText) {
                      <tr>
                        <td><strong>{{ uv.searchText }}</strong></td>
                        <td class="row-indices">{{ (uv.rowIndices || []).length }} filas</td>
                        <td>
                          <mat-form-field appearance="outline" class="campo ref-action-select">
                            <mat-select [ngModel]="getActiveUniqueValueAction(refCol, uv.searchText)"
                                        (ngModelChange)="setActiveUniqueValueAction(refCol, uv, $event)">
                              <mat-option value="use_existing">Usar existente</mat-option>
                              <mat-option value="create">Crear nuevo</mat-option>
                              <mat-option value="skip">Omitir</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </td>
                        <td>
                          @if (getActiveUniqueValueAction(refCol, uv.searchText) === 'create') {
                            <span class="create-badge">Se creará "{{ uv.searchText }}"</span>
                          } @else if (getActiveUniqueValueAction(refCol, uv.searchText) === 'skip') {
                            <span class="create-badge" style="color: var(--simr-tinta-2);">Omitido</span>
                          } @else {
                            @if ((uv.matches || []).length > 0) {
                              <mat-form-field appearance="outline" class="campo ref-match-select">
                                <mat-select [ngModel]="getActiveUniqueValueMatchId(refCol, uv.searchText)"
                                            (ngModelChange)="onActiveRefMatchSelect(refCol, uv, $event)">
                                  @for (m of uv.matches; track m._id) {
                                    <mat-option [value]="m._id">{{ m.displayValue }}</mat-option>
                                  }
                                </mat-select>
                              </mat-form-field>
                            }
                            <div class="ref-search-row">
                              <mat-form-field appearance="outline" class="campo ref-search-input">
                                <input matInput [ngModel]="refSearchTexts()[getSearchKey(refCol, uv.searchText)] || ''"
                                       (ngModelChange)="onRefSearchChange(refCol, uv.searchText, $event)"
                                       placeholder="Buscar en {{ refCol.refEntity }}..." />
                              </mat-form-field>
                              <button mat-stroked-button (click)="buscarRef(refCol, uv)">Buscar</button>
                            </div>
                            @if (getRefSearchResults(refCol, uv.searchText); as results) {
                              <div class="ref-search-results">
                                @for (r of results; track r._id) {
                                  <div class="ref-search-item" (click)="selectRefFromSearch(refCol, uv, r)">
                                    {{ r.displayValue }}
                                  </div>
                                }
                              </div>
                            }
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-collapsible-section>
          }
        }
        <div class="step-actions">
          <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(2)">← Volver</button>
          <button mat-flat-button color="primary" (click)="irAValidar()">Siguiente</button>
        </div>
      </mat-card>
    }

    <!-- STEP 4: Validación y deduplicación (multi-entidad) -->
    @if (step() === 4) {
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

        <div class="entity-tabs">
          @for (ec of importEntities(); track ec.entityName; let i = $index) {
            <button class="entity-tab" [class.active]="activeEntityIndex() === i" (click)="switchValidationEntity(i)">
              <mat-icon>{{ i === 0 ? 'star' : 'layers' }}</mat-icon>
              {{ ec.label }}
              <span class="tab-count">{{ countSelected(ec.validationResults) }}/{{ ec.validationResults.length }}</span>
            </button>
          }
        </div>

        <div class="table-toolbar">
          <span class="toolbar-spacer"></span>
          <button mat-stroked-button [matMenuTriggerFor]="colMenu" class="column-selector-btn">
            <mat-icon>view_column</mat-icon>
            Columnas ({{ visibleValidationColumns().length }}/{{ validationColumns().length }})
          </button>
          <mat-menu #colMenu="matMenu" class="column-options-panel">
            @for (col of validationColumns(); track col.key) {
              <button mat-menu-item (click)="toggleColumnVisibility(col.key)">
                <mat-icon>{{ hiddenColumns().has(col.key) ? 'check_box_outline_blank' : 'check_box' }}</mat-icon>
                {{ col.label }}
              </button>
            }
          </mat-menu>
        </div>

        <div class="table-wrap">
          <table class="validation-table">
            <thead>
              <tr>
                <th class="sticky-check"><mat-checkbox (change)="toggleAllRows($event.checked)" [checked]="allSelected()" [indeterminate]="someSelected()"></mat-checkbox></th>
                @for (col of visibleValidationColumns(); track col.key) {
                  <th [class.sticky-first]="col.key === firstVisibleColumnKey()">
                    {{ col.label }}
                    <input class="filter-input" [ngModel]="filters()[col.key] || ''" (ngModelChange)="setFilter(col.key, $event)" placeholder="Filtrar..." />
                  </th>
                }
                <th>Coincidencia</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (v of pagedResults(); track v.rowIndex) {
                <tr [class.match-row]="v.matchFound" [class.omit-row]="!v.selected">
                  <td class="sticky-check"><mat-checkbox [(ngModel)]="v.selected" (ngModelChange)="onValidationCheckChange()"></mat-checkbox></td>
                  @for (col of visibleValidationColumns(); track col.key) {
                    <td [class.sticky-first]="col.key === firstVisibleColumnKey()">
                      <input class="editable-cell-input" [ngModel]="getValidationValue(v, col)"
                             (ngModelChange)="setValidationValue(v, col, $event)"
                             [matTooltip]="getValidationValue(v, col) || '—'"
                             placeholder="—" />
                    </td>
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
        <div class="pagination-bar">
          <span class="page-info">Mostrando {{ pageStart() + 1 }}-{{ pageEnd() }} de {{ filteredResults().length }} @if (filteredResults().length !== activeValidationResults().length) { (filtrados de {{ activeValidationResults().length }}) }</span>
          <div class="page-controls">
            <button mat-stroked-button [disabled]="pageIndex() === 0" (click)="prevPage()">‹ Anterior</button>
            <button mat-stroked-button [disabled]="pageEnd() >= activeValidationResults().length" (click)="nextPage()">Siguiente ›</button>
            <mat-form-field appearance="outline" class="campo page-size-select">
              <mat-select [ngModel]="pageSize()" (ngModelChange)="pageSize.set($event); pageIndex.set(0)">
                <mat-option [value]="50">50</mat-option>
                <mat-option [value]="100">100</mat-option>
                <mat-option [value]="200">200</mat-option>
                <mat-option [value]="500">500</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        <div class="step-actions">
          <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(3)">← Volver</button>
          <button mat-flat-button color="primary" [disabled]="!anyEntitySelected()" (click)="irAConfirmar()">
            Siguiente
          </button>
        </div>
      </mat-card>
    }

    <!-- STEP 5: Confirmación y escritura -->
    @if (step() === 5) {
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
            <button mat-stroked-button style="color: var(--simr-musgo)" (click)="step.set(4)">← Volver a validar</button>
            <button mat-flat-button color="primary" [disabled]="executing()" (click)="ejecutarImportacion()" class="btn-execute">
              @if (executing()) { <mat-spinner diameter="20"></mat-spinner> }
              Confirmar e importar
            </button>
          </div>
        }

        @if (executed() || importLog().length > 0) {
          <mat-divider style="margin: 1.5rem 0"></mat-divider>
          <h3>Registro de importación</h3>
          <div class="entity-tabs">
            @for (ec of importEntities(); track ec.entityName; let i = $index) {
              <button class="entity-tab" [class.active]="activeEntityIndex() === i" (click)="activeEntityIndex.set(i)">
                <mat-icon>{{ i === 0 ? 'star' : 'layers' }}</mat-icon>
                {{ ec.label }}
              </button>
            }
          </div>
          <div class="log-panel">
            @for (entry of getActiveImportLog(); track $index) {
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
              <button mat-stroked-button (click)="resetImportacion()">Nueva importación</button>
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
    .step-item.clickable { cursor: pointer; }
    .step-item.clickable .step-circle { transition: transform 0.15s, box-shadow 0.15s; }
    .step-item.clickable:hover .step-circle { transform: scale(1.08); box-shadow: 0 2px 8px rgba(92, 122, 90, 0.35); }
    .step-item.clickable .step-label { text-decoration: underline dotted rgba(92, 122, 90, 0.6); }
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
    .preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .preview-header h3 { margin: 0; }
    .preview-header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .test-banner { display: flex; align-items: center; gap: 0.5rem; background: rgba(200, 119, 46, 0.1); border-left: 3px solid var(--simr-cobre); padding: 0.5rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .filter-input { width: 100%; border: 1px solid var(--mat-sys-outline-variant); border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.75rem; margin-top: 0.25rem; background: var(--simr-hueso); color: var(--simr-tinta); }
    .filter-input:focus { outline-color: var(--simr-sello); }
    .table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); }
    .preview-table, .validation-table, .ref-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .preview-table th, .validation-table th, .ref-table th { background: var(--simr-papel); padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; color: var(--simr-tinta-2); border-bottom: 1px solid var(--mat-sys-outline-variant); white-space: nowrap; max-width: 220px; }
    .preview-table .col-head { display: inline-block; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }
    .preview-table td, .validation-table td, .ref-table td { padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--mat-sys-outline-variant); color: var(--simr-tinta); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .preview-table .row-num { color: var(--simr-tinta-2); opacity: 0.6; width: 2rem; text-align: center; }
    .total-rows { color: var(--simr-tinta-2); font-size: 0.85rem; margin-top: 0.5rem; }

    .entity-select { width: 100%; max-width: 400px; }
    .entity-desc { color: var(--simr-tinta-2); margin: 0 0 1rem; font-size: 0.9rem; }
    .entity-fields-preview { margin-top: 1rem; }
    .entity-fields-preview strong { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--simr-tinta-2); }
    .entity-field-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .entity-chip { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 6px; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline-variant); }
    .entity-chip.ref-chip { border-color: var(--simr-cobre); background: rgba(200, 119, 46, 0.06); }
    .ref-badge { font-size: 0.65rem; background: var(--simr-cobre); color: #fff; padding: 0.05rem 0.35rem; border-radius: 3px; margin-left: 0.25rem; }
    .ref-badge-sm { font-size: 0.6rem; background: var(--simr-cobre); color: #fff; padding: 0.05rem 0.3rem; border-radius: 3px; margin-left: auto; }

    .warning-banner { display: flex; align-items: center; gap: 0.5rem; background: rgba(200, 119, 46, 0.1); border-left: 3px solid var(--simr-cobre); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .ref-rol-input { min-width: 160px; }

    .ref-table-wrap { overflow-x: auto; }
    .ref-table td { max-width: none; }
    .ref-action-select { min-width: 150px; }
    .ref-match-select { min-width: 200px; }
    .create-badge { font-size: 0.8rem; color: var(--simr-musgo); font-weight: 500; }
    .no-match { color: var(--simr-tinta-2); font-style: italic; }
    .no-refs { color: var(--simr-tinta-2); text-align: center; padding: 2rem; }
    .ref-search-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
    .ref-search-input { flex: 1; min-width: 150px; }
    .ref-search-results { max-height: 200px; overflow-y: auto; border: 1px solid var(--mat-sys-outline-variant); border-radius: 6px; margin-top: 0.25rem; }
    .ref-search-item { padding: 0.3rem 0.5rem; cursor: pointer; font-size: 0.85rem; }
    .ref-search-item:hover { background: rgba(200, 119, 46, 0.08); }
    .row-indices { font-size: 0.8rem; color: var(--simr-tinta-2); }

    .summary-bar { display: flex; gap: 1.5rem; margin-bottom: 1rem; padding: 0.75rem 1rem; background: var(--simr-papel); border-radius: 8px; font-size: 0.9rem; }
    .summary-item { display: flex; gap: 0.25rem; }
    .validation-table { width: max-content; min-width: 100%; }
    .validation-table th { vertical-align: top; padding: 0.5rem 0.4rem; min-width: 170px; max-width: 240px; }
    .validation-table td { min-width: 170px; max-width: 240px; }
    .validation-table .sticky-check { width: 48px; min-width: 48px; max-width: 48px; padding: 0.4rem; }
    .validation-table th.sticky-check { vertical-align: middle; }
    .validation-table .sticky-first { min-width: 280px; max-width: 340px; }
    .validation-table th.sticky-check, .validation-table td.sticky-check {
      position: sticky; left: 0; background: var(--simr-papel); z-index: 3;
    }
    .validation-table th.sticky-first { position: sticky; left: 56px; background: var(--simr-papel); z-index: 2; }
    .validation-table td.sticky-first { position: sticky; left: 56px; background: #fff; z-index: 2; }
    .filter-input { display: block; width: 100%; margin-top: 0.35rem; box-sizing: border-box; padding: 0.3rem 0.5rem; font-size: 0.75rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 4px; background: var(--simr-papel); color: var(--simr-tinta); outline: none; font-family: inherit; }
    .filter-input:focus { border-color: var(--simr-cobre); }
    .editable-cell-input { width: 100%; box-sizing: border-box; padding: 0.25rem 0.35rem; font-size: 0.8rem; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--simr-tinta); outline: none; font-family: inherit; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    .editable-cell-input:hover { border-color: var(--mat-sys-outline-variant); }
    .editable-cell-input:focus { border-color: var(--simr-cobre); background: #fff; }
    .match-row { background: rgba(92, 122, 90, 0.04); }
    .omit-row { opacity: 0.5; }
    .no-match { color: var(--simr-tinta-2); opacity: 0.5; font-style: italic; }
    .match-link { color: var(--simr-cobre); text-decoration: underline; cursor: pointer; font-size: 0.85rem; }
    .action-select { min-width: 160px; }

    .pagination-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; margin-top: 0.5rem; }
    .table-toolbar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .toolbar-spacer { flex: 1; }
    .column-selector-btn { font-size: 0.8rem; }
    .column-options-panel { max-width: 320px; }
    .page-info { font-size: 0.85rem; color: var(--simr-tinta-2); }
    .page-controls { display: flex; align-items: center; gap: 0.5rem; }
    .page-size-select { width: 80px; }

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

    .entity-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .entity-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); background: var(--simr-hueso); cursor: pointer; font-size: 0.85rem; color: var(--simr-tinta-2); transition: all 0.15s; }
    .entity-tab:hover { border-color: var(--simr-cobre); }
    .entity-tab.active { background: var(--simr-sello); color: #fff; border-color: var(--simr-sello); }
    .entity-tab .tab-count { font-size: 0.7rem; opacity: 0.7; margin-left: 0.25rem; }
    .entity-tab.active .tab-count { opacity: 0.85; }

    .entity-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .entity-list-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--mat-sys-outline-variant); background: var(--simr-papel); }
    .entity-list-item.primary { border-color: var(--simr-sello); background: rgba(181, 67, 42, 0.04); }
    .entity-badge { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--mat-sys-outline-variant); color: var(--simr-tinta-2); }
    .entity-badge.primary-badge { background: var(--simr-sello); color: #fff; }
    .entity-info { flex: 1; }
    .entity-info strong { display: block; color: var(--simr-tinta); font-size: 0.95rem; }
    .entity-meta { font-size: 0.8rem; color: var(--simr-tinta-2); }
    .auto-link-chips { display: flex; gap: 0.4rem; margin-top: 0.3rem; flex-wrap: wrap; }
    .link-chip { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(92, 122, 90, 0.1); border: 1px solid rgba(92, 122, 90, 0.3); color: var(--simr-musgo); }

    .entity-picker { margin: 1.5rem 0; }
    .picker-label { display: block; font-weight: 600; font-size: 0.95rem; color: var(--simr-tinta); margin-bottom: 0.75rem; }
    .picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
    .picker-card { padding: 1rem; border-radius: 10px; border: 2px solid var(--mat-sys-outline-variant); background: var(--simr-papel); cursor: pointer; text-align: center; transition: all 0.15s; }
    .picker-card:hover { border-color: var(--simr-cobre); background: rgba(200, 119, 46, 0.04); }
    .picker-card strong { display: block; color: var(--simr-tinta); margin-bottom: 0.25rem; }
    .picker-meta { font-size: 0.75rem; color: var(--simr-tinta-2); }

    .add-entity-btn { margin-bottom: 1rem; }
    .add-entity-panel { border: 1px solid var(--mat-sys-outline-variant); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; background: var(--simr-papel); display: flex; flex-direction: column; gap: 0.75rem; }
    .auto-link-config { display: flex; flex-direction: column; gap: 0.5rem; }
    .link-desc { font-size: 0.85rem; color: var(--simr-tinta-2); margin: 0; }
    .link-detail { font-size: 0.75rem; opacity: 0.6; }
    .no-links { font-size: 0.85rem; color: var(--simr-tinta-2); font-style: italic; }

    .entity-flow { margin-top: 1rem; padding: 1rem; background: var(--simr-papel); border-radius: 8px; }
    .entity-flow strong { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--simr-tinta-2); }
    .flow-chart { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .flow-node { display: flex; align-items: center; gap: 0.25rem; padding: 0.3rem 0.75rem; border-radius: 6px; background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline-variant); font-size: 0.85rem; }
    .flow-arrow { font-size: 0.7rem; color: var(--simr-cobre); }
    .flow-sep { color: var(--simr-tinta-2); font-size: 1.2rem; }

    .mapping-form-header { margin-bottom: 1.5rem; }
    .mapping-form-header h3 { font-family: var(--simr-display); color: var(--simr-tinta); margin: 0 0 0.25rem; font-size: 1.1rem; }
    .form-desc { color: var(--simr-tinta-2); margin: 0; font-size: 0.9rem; }

    .mapping-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem 1rem; border-radius: 10px; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline-variant); }
    .form-row-label { min-width: 180px; display: flex; align-items: center; gap: 0.5rem; padding-top: 0.25rem; }
    .form-row-label .field-label { font-weight: 600; color: var(--simr-tinta); font-size: 0.9rem; }
    .form-row-controls { flex: 1; display: flex; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap; }
    .column-select { flex: 1; min-width: 220px; }
    .sub-column-select { min-width: 180px; }
    .sub-column-select input { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .badge { font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; }
    .badge-main { background: var(--simr-musgo); color: #fff; }
    .badge-ref { background: var(--simr-cobre); color: #fff; }
    .badge-compound { background: var(--simr-sello); color: #fff; }
    .badge-companion { background: var(--simr-tinta-2); color: #fff; }
    .delimiter-input { min-width: 90px; max-width: 110px; }

    .field-card { display: flex; flex-direction: column; gap: 0.75rem; padding: 0.9rem 1.1rem; border-radius: 10px; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline-variant); transition: border-color 0.15s; }
    .field-card.field-card-mapped { border-color: rgba(92, 122, 90, 0.5); }
    .field-card-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .field-card-header .field-label { font-weight: 600; color: var(--simr-tinta); font-size: 0.9rem; }
    .header-spacer { flex: 1; }
    .field-card-body { display: flex; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap; }
    .chips-row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; flex: 1; min-width: 240px; }
    .column-chip { display: inline-flex; align-items: center; gap: 0.1rem; font-size: 0.78rem; padding: 0.1rem 0.25rem 0.1rem 0.6rem; border-radius: 16px; background: rgba(92, 122, 90, 0.1); border: 1px solid rgba(92, 122, 90, 0.35); color: var(--simr-musgo); }
    .column-chip .chip-name { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .column-chip button { width: 22px; height: 22px; line-height: 22px; }
    .column-chip mat-icon { font-size: 14px; width: 14px; height: 14px; line-height: 14px; }
    .column-search-input { width: 200px; }
    .col-option { display: flex; flex-direction: column; line-height: 1.25; }
    .col-option-name { font-weight: 500; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-option-example { font-size: 0.7rem; color: var(--simr-tinta-2); }
    .constant-input { min-width: 210px; max-width: 260px; flex: 1; }
    .constant-hint { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--simr-cobre); background: rgba(200, 119, 46, 0.08); border-left: 3px solid var(--simr-cobre); padding: 0.35rem 0.6rem; border-radius: 4px; }
    .constant-hint mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .companions-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.5rem 0.6rem; border-radius: 8px; background: rgba(31, 42, 36, 0.04); }
    .companions-label { font-size: 0.75rem; font-weight: 600; color: var(--simr-tinta-2); text-transform: uppercase; letter-spacing: 0.04em; }
    .companion-item { display: flex; align-items: center; gap: 0.4rem; }
    .companion-name { font-size: 0.82rem; color: var(--simr-tinta); }
    .companion-column-select { min-width: 150px; }
    .companion-constant-input { min-width: 100px; max-width: 140px; }
    .sub-constant-input { min-width: 90px; max-width: 120px; }

    .primary-tag { font-size: 0.6rem; background: var(--simr-sello); color: #fff; padding: 0.05rem 0.35rem; border-radius: 3px; margin-left: 0.35rem; vertical-align: middle; }
    .add-panel-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .link-option-text { font-size: 0.85rem; }
    .descriptor-key-input { min-width: 180px; max-width: 240px; }
    .descriptor-val-input { flex: 1; min-width: 220px; }

    .compound-section { margin: 0.5rem 0 0.5rem 1.5rem; padding-left: 1rem; border-left: 2px solid var(--mat-sys-outline-variant); }
    .compound-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .compound-title { font-weight: 600; color: var(--simr-tinta); font-size: 0.85rem; }
    .no-groups-msg { color: var(--simr-tinta-2); font-style: italic; font-size: 0.85rem; padding: 0.5rem 0; }

    .compound-group-card { border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem; background: #fff; }
    .compound-group-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .compound-group-card-header strong { font-size: 0.85rem; color: var(--simr-tinta); }
    .group-card-controls { display: flex; align-items: center; gap: 0.5rem; }

    .sub-field-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.35rem 0; }
    .sub-field-label { min-width: 120px; font-size: 0.85rem; color: var(--simr-tinta-2); }

    .column-options-panel { max-height: 300px; }

    .unmapped-section { margin-top: 0.5rem; }
    .unmapped-section h3 { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1rem; margin: 0 0 0.25rem; }
    .unmapped-hint { color: var(--simr-tinta-2); font-size: 0.85rem; margin: 0 0 0.75rem; }
    .unmapped-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .unmapped-chip { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 6px; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline-variant); color: var(--simr-tinta-2); }

    @media (max-width: 800px) {
      .mapping-form { gap: 0.75rem; }
      .form-row { flex-direction: column; gap: 0.5rem; }
      .form-row-label { min-width: auto; }
      .field-card-body { flex-direction: column; }
      .compound-section { margin-left: 0.5rem; }
      .sub-field-row { flex-direction: column; align-items: stretch; }
      .sub-field-label { min-width: auto; }
    }
  `],
})
export class ImportarExcelComponent implements OnInit {
  private readonly service = inject(ImportarExcelService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sweetAlert = inject(SweetAlertService);
  private readonly ngZone = inject(NgZone);
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  entitiesSelected = signal(false);

  trackByIndex(index: number) { return index; }

  readonly steps: StepInfo[] = [
    { label: "Cargar", icon: "cloud_upload" },
    { label: "Entidad", icon: "category" },
    { label: "Mapear", icon: "swap_horiz" },
    { label: "Referencias", icon: "link" },
    { label: "Validar", icon: "fact_check" },
    { label: "Importar", icon: "file_download" },
  ];

  step = signal(0);
  stepStatus = signal<("pending" | "active" | "completed")[]>([
    "active", "pending", "pending", "pending", "pending", "pending",
  ]);

  canGoToStep(i: number): boolean {
    return i < this.step() && this.stepStatus()[i] === "completed";
  }

  goToStep(i: number) {
    if (!this.canGoToStep(i)) return;
    this.step.set(i);
    const status = [...this.stepStatus()];
    status[i] = "active";
    for (let k = i + 1; k < status.length; k++) status[k] = "pending";
    this.stepStatus.set(status);
  }
  file = signal<File | null>(null);
  preview = signal<PreviewResponse | null>(null);
  entityInfos = computed(() =>
    [...(this.preview()?.entities ?? [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  );
  importEntities = signal<EntityImportConfig[]>([]);
  activeEntityIndex = signal(0);
  activeEntity = computed(() => this.importEntities()[this.activeEntityIndex()]);
  activeEntityName = computed(() => this.activeEntity()?.entityName ?? null);
  activeEntityLabel = computed(() => this.activeEntity()?.label ?? "");
  activeEntityFields = computed(() => this.activeEntity()?.fields ?? []);
  activeScalarFields = computed(() => this.activeEntityFields().filter((f) => !f.isRef && !f.isCompoundObject));
  activeRelationFields = computed(() => this.activeEntityFields().filter((f) => f.isRef && !this.isCompoundField(f)));
  activeCompoundFields = computed(() => this.activeEntityFields().filter((f) => this.isCompoundField(f)));
  activeMappings = computed(() => this.activeEntity()?.mappings ?? []);
  activeRefResults = computed(() => this.activeEntity()?.refResults ?? []);
  activeValidationResults = computed(() => this.activeEntity()?.validationResults ?? []);

  previewColumns = computed(() => {
    const p = this.preview();
    if (!p) return [];
    return p.columns.map((name, i) => {
      const hasData = p.rows.some((r) => r[i] != null && String(r[i]).trim() !== "");
      return { name, hasData, index: i };
    }).filter((c) => c.hasData);
  });

  previewRows = computed(() => {
    const p = this.preview();
    if (!p) return [];
    const colIndices = p.columns.map((_, i) => i).filter((i) =>
      p.rows.some((r) => r[i] != null && String(r[i]).trim() !== "")
    );
    if (this.testMode()) {
      return this.testRows().map((row) => colIndices.map((i) => row[i]));
    }
    const shuffled = [...p.previewRows].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((row) => colIndices.map((i) => row[i]));
  });

  // Per-entity shared state keyed by entityName
  refSearchTexts = signal<Record<string, string>>({});
  refSearchResults = signal<Record<string, RefMatchItem[]>>({});
  importLog = signal<ImportResult[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  isDragging = signal(false);
  executing = signal(false);
  executed = signal(false);
  testMode = signal(false);
  testRows = signal<string[][]>([]);

  setTestMode(v: boolean) {
    this.testMode.set(v);
    if (v) {
      if (this.testRows().length === 0) this.refreshTestRows();
    } else {
      this.testRows.set([]);
    }
  }

  refreshTestRows() {
    const p = this.preview();
    if (!p) return;
    const pool = p.rows.length ? p.rows : p.previewRows;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.testRows.set(shuffled.slice(0, 5));
  }
  roles = signal<string[]>([]);

  // Fixed-value lists (listas) loaded on demand: name -> elements
  listaCache = signal<Record<string, string[]>>({});

  ensureLista(name: string) {
    if (!name || this.listaCache()[name]) return;
    this.service.getLista(name).subscribe({
      next: (res) => {
        this.listaCache.update((c) => ({ ...c, [name]: res.data?.elementos ?? [] }));
      },
      error: () => {
        this.listaCache.update((c) => ({ ...c, [name]: [] }));
      },
    });
  }

  filteredLista(name: string, query: string): string[] {
    if (!name) return [];
    this.ensureLista(name);
    const elements = this.listaCache()[name] ?? [];
    const q = (query || "").toLowerCase();
    if (elements.length > 200 && !q) return [];
    return elements.filter((e) => !q || e.toLowerCase().includes(q)).slice(0, 50);
  }

  isCompoundField(f: EntityField): boolean {
    return !!f.isCompoundObject || !!(f.isRef && f.subFields && f.subFields.length > 0);
  }

  // Field column search text (for autocomplete filtering)
  fieldColumnSearch = signal<Record<string, string>>({});

  // Validation pagination (per active entity)
  pageIndex = signal(0);
  pageSize = signal(100);
  filters = signal<Record<string, string>>({});

  setFilter(field: string, value: string) {
    this.filters.update((f) => ({ ...f, [field]: value }));
    this.pageIndex.set(0);
  }

  filteredResults = computed(() => {
    const all = this.activeValidationResults();
    const f = this.filters();
    const cols = this.validationColumns();
    const activeFilters = Object.entries(f).filter(([, v]) => v.trim());
    if (activeFilters.length === 0) return all;
    return all.filter((v) =>
      activeFilters.every(([key, filterVal]) => {
        const col = cols.find((c) => c.key === key);
        if (!col) return true;
        const cell = this.getValidationValue(v, col);
        return cell.toLowerCase().includes(filterVal.toLowerCase());
      })
    );
  });

  pagedResults = computed(() => {
    const all = this.filteredResults();
    const start = this.pageIndex() * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });
  pageStart = computed(() => this.pageIndex() * this.pageSize());
  pageEnd = computed(() => Math.min(this.pageStart() + this.pageSize(), this.activeValidationResults().length));
  allSelected = computed(() => this.pagedResults().length > 0 && this.pagedResults().every((r) => r.selected));
  someSelected = computed(() => this.pagedResults().some((r) => r.selected));
  anySelected = computed(() => this.activeValidationResults().some((r) => r.selected));

  prevPage() { this.pageIndex.update((p) => Math.max(0, p - 1)); }
  nextPage() { this.pageIndex.update((p) => p + 1); }

  // Summary stats across ALL entities
  allValidationResults = computed(() => this.importEntities().flatMap((e) => e.validationResults));
  step3New = computed(() => this.allValidationResults().filter((r) => r.suggestedAction === "create" && r.selected).length);
  step3Update = computed(() => this.allValidationResults().filter((r) => r.suggestedAction === "update" && r.selected).length);
  step3Skipped = computed(() => this.allValidationResults().filter((r) => !r.selected).length);
  finalNew = computed(() => this.allValidationResults().filter((r) => r.selected && r.suggestedAction === "create").length);
  finalUpdate = computed(() => this.allValidationResults().filter((r) => r.selected && r.suggestedAction === "update").length);
  finalSkip = computed(() => this.allValidationResults().filter((r) => !r.selected || r.suggestedAction === "skip").length);

  validationColumns = computed<ValidationColumn[]>(() => {
    const en = this.activeEntityName();
    const ec = this.activeEntity();
    if (!en || !ec) return [];
    const cols: ValidationColumn[] = [];
    const seen = new Set<string>();
    for (const m of this.activeMappings().filter((mm) => !mm.ignore && mm.field && mm.entity === en)) {
      const key = `f:${m.field}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const field = ec.fields.find((f) => f.name === m.field);
      cols.push({ kind: "field", key, entityName: en, field: m.field ?? "", label: field?.label ?? m.field ?? "" });
    }
    const addSub = (groupKind: "object" | "ref", grp: CompoundObjectGroup | CompoundRefGroup, subField: string) => {
      const key = `${groupKind}:${grp.id}:${subField}`;
      if (seen.has(key)) return;
      seen.add(key);
      const fname = "field" in grp ? grp.field : grp.refField;
      const field = ec.fields.find((f) => f.name === fname);
      const subLabel = field?.subFields?.find((s) => s.name === subField)?.label || subField;
      cols.push({
        kind: "sub", key, entityName: en, field: fname,
        subField, groupKind, groupId: grp.id,
        label: `${field?.label || fname} · ${subLabel}`,
      });
    };
    for (const grp of ec.compoundObjectGroups ?? []) {
      for (const sm of grp.subMappings) {
        if (sm.subField) addSub("object", grp, sm.subField);
      }
    }
    for (const grp of ec.compoundRefGroups ?? []) {
      for (const sm of grp.subMappings) {
        if (sm.subField) addSub("ref", grp, sm.subField);
      }
    }
    return cols;
  });

  // Column visibility selector (validation step)
  hiddenColumns = signal<Set<string>>(new Set());

  toggleColumnVisibility(key: string) {
    this.hiddenColumns.update((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  visibleValidationColumns = computed(() => this.validationColumns().filter((c) => !this.hiddenColumns().has(c.key)));

  firstVisibleColumnKey = computed(() => this.visibleValidationColumns()[0]?.key ?? null);

  // Available entities for secondary (not already in importEntities)
  availableSecondaryEntities = computed(() => {
    const existing = new Set(this.importEntities().map((e) => e.entityName));
    return this.entityInfos().filter((e) => !existing.has(e.name));
  });

  // Per-active-entity helpers
  anyEntityHasMapping = computed(() => this.importEntities().some((e) => e.mappings.some((m) => m.field && !m.ignore)));

  // Step 1 add-entity UI state
  showAddEntity = signal(false);
  newSecondaryEntityName = signal<string | null>(null);
  selectedAutoLinks = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.stepStatus.set(["active", "pending", "pending", "pending", "pending", "pending"]);
    this.service.getRoles().subscribe({
      next: (res) => this.roles.set([...new Set(res.data?.elementos ?? [])]),
      error: () => {},
    });
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
    this.importEntities.set([]);
    this.error.set(null);
    if (this.fileInput) this.fileInput.nativeElement.value = "";
  }

  resetImportacion() {
    this.step.set(0);
    this.stepStatus.set(["active", "pending", "pending", "pending", "pending", "pending"]);
    this.file.set(null);
    this.preview.set(null);
    this.importEntities.set([]);
    this.activeEntityIndex.set(0);
    this.entitiesSelected.set(false);
    this.importLog.set([]);
    this.executedLogByEntity = [];
    this.executed.set(false);
    this.executing.set(false);
    this.error.set(null);
    this.testMode.set(false);
    this.testRows.set([]);
    this.refSearchTexts.set({});
    this.refSearchResults.set({});
    this.filters.set({});
    this.pageIndex.set(0);
    this.fieldColumnSearch.set({});
    this.showAddEntity.set(false);
    this.newSecondaryEntityName.set(null);
    this.selectedAutoLinks.set({});
    if (this.fileInput) this.fileInput.nativeElement.value = "";
  }

  // ─── Preview & entity detection ─────────────────────────────

  cargarArchivo() {
    const f = this.file();
    if (!f) return;
    this.loading.set(true);
    this.error.set(null);
    this.service.preview(f).subscribe({
      next: (res) => {
        this.preview.set(res.data);
        this.loading.set(false);
        this.importEntities.set([]);
        this.activeEntityIndex.set(0);
        this.testRows.set([]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || "Error al procesar el archivo");
      },
    });
  }

  selectPrimaryEntity(entityName: string) {
    const data = this.preview();
    if (!data) return;
    const info = data.entities.find((e) => e.name === entityName);
    if (!info) return;
    const config = this.makeEntityConfig(info, data);
    this.importEntities.set([config]);
    this.activeEntityIndex.set(0);
    this.entitiesSelected.set(true);
    this.showAddEntity.set(false);
    this.newSecondaryEntityName.set(null);
    this.selectedAutoLinks.set({});
  }

  onSecondaryEntityChange() {
    this.selectedAutoLinks.set({});
  }

  private makeEntityConfig(info: { name: string; label: string; fields: EntityField[] }, data: PreviewResponse): EntityImportConfig {
    const en = info.name;
    const mappings = data.columns.map((col, i) => ({
      columnIndex: i,
      columnName: col,
      entity: en,
      field: null,
      confidence: 0,
      ignore: false,
      asDescriptor: false,
      descriptorKey: col,
    }));
    const compoundRefGroups: CompoundRefGroup[] = info.fields
      .filter((f) => f.isRef && f.subFields && f.subFields.length > 0)
      .map((f) => ({
        id: 'crg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        entityName: en,
        refField: f.name,
        subMappings: [],
        refRol: null,
      }));
    const compoundObjectGroups: CompoundObjectGroup[] = info.fields
      .filter((f) => f.isCompoundObject && f.subFields && f.subFields.length > 0)
      .map((f) => ({
        id: 'cog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        entityName: en,
        field: f.name,
        subMappings: [],
      }));
    return {
      entityName: en,
      label: info.label,
      fields: info.fields,
      mappings,
      compoundRefGroups,
      compoundObjectGroups,
      fixedDescriptors: [],
      actions: [],
      refResolutions: {},
      refResults: [],
      validationResults: [],
    };
  }

  // ─── Step 1: Entity management ──────────────────────────────

  getEntityLabel(name: string): string {
    return this.entityInfos().find((e) => e.name === name)?.label ?? name;
  }

  getAutoLinkCandidates(entityName: string): { field: string; parentEntity: string; reverse: boolean }[] {
    const info = this.entityInfos().find((e) => e.name === entityName);
    if (!info) return [];
    const existing = this.importEntities().map((e) => e.entityName);

    // Forward: field on candidate entity → references an existing entity
    const forward = info.refs
      .filter((r) => existing.includes(r.refEntity))
      .map((r) => ({ field: r.field, parentEntity: r.refEntity, reverse: false }));

    // Reverse: field on existing entity → references candidate entity
    const reverse: { field: string; parentEntity: string; reverse: boolean }[] = [];
    for (const ex of this.importEntities()) {
      const exInfo = this.entityInfos().find((e) => e.name === ex.entityName);
      if (!exInfo) continue;
      for (const r of exInfo.refs.filter((ref) => ref.refEntity === entityName)) {
        reverse.push({ field: r.field, parentEntity: ex.entityName, reverse: true });
      }
    }

    return [...forward, ...reverse];
  }

  toggleAutoLink(_entityName: string, candidate: { field: string; parentEntity: string; reverse: boolean }, checked: boolean) {
    const key = candidate.field + '_' + candidate.reverse;
    this.selectedAutoLinks.update((s) => ({ ...s, [key]: checked }));
  }

  hasValidAutoLink(entityName: string): boolean {
    const candidates = this.getAutoLinkCandidates(entityName);
    return candidates.length === 0 ||
      candidates.some((c) => this.selectedAutoLinks()[c.field + '_' + c.reverse]);
  }

  addSecondaryEntity() {
    const name = this.newSecondaryEntityName();
    if (!name) return;
    const info = this.entityInfos().find((e) => e.name === name);
    if (!info) return;
    const data = this.preview();
    if (!data) return;

    const autoLinks: AutoLinkConfig[] = this.getAutoLinkCandidates(name)
      .filter((c) => this.selectedAutoLinks()[c.field + '_' + c.reverse])
      .map((c) => ({ parentEntity: c.parentEntity, field: c.field, reverse: c.reverse }));

    const config = this.makeEntityConfig(info, data);
    config.autoLinks = autoLinks.length > 0 ? autoLinks : undefined;
    this.importEntities.update((list) => [...list, config]);
    this.newSecondaryEntityName.set(null);
    this.selectedAutoLinks.set({});
    this.showAddEntity.set(false);
    this.entitiesSelected.set(this.importEntities().length > 0);
  }

  removeEntity(index: number) {
    this.importEntities.update((list) => list.filter((_, i) => i !== index));
    this.entitiesSelected.set(this.importEntities().length > 0);
    this.activeEntityIndex.set(0);
    if (this.importEntities().length === 0) {
      this.showAddEntity.set(false);
      this.newSecondaryEntityName.set(null);
      this.selectedAutoLinks.set({});
    }
    if (this.activeEntityIndex() >= this.importEntities().length) {
      this.activeEntityIndex.set(Math.max(0, this.importEntities().length - 1));
    }
  }

  // ─── Step 2: Mapping helpers ────────────────────────────────

  updateActiveMappings() {
    this.importEntities.update((list) => [...list]);
  }

  getFieldColumn(fieldName: string): number | null {
    const m = this.activeMappings().find((m) => m.field === fieldName && !m.ignore);
    return m?.columnIndex ?? null;
  }

  getFieldColumnIndices(fieldName: string): number[] {
    return this.activeMappings()
      .filter((m) => m.field === fieldName && !m.ignore)
      .map((m) => m.columnIndex);
  }

  getColumnName(columnIndex: number): string {
    return this.previewColumns().find((c) => c.index === columnIndex)?.name ?? "";
  }

  setFieldColumn(fieldName: string, columnIndex: number | null) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) => {
          if (columnIndex !== null && m.columnIndex === columnIndex) {
            if (m.field === fieldName) return m;
            return { ...m, field: fieldName, subField: null, entity: en, asDescriptor: false, descriptorKey: "", ignore: false };
          }
          if (columnIndex === null && m.field === fieldName) {
            return { ...m, field: null, subField: null, asDescriptor: false, descriptorKey: m.columnName, ignore: true };
          }
          return m;
        });
        return { ...e, mappings };
      })
    );
  }

  removeFieldColumn(fieldName: string, columnIndex: number) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.columnIndex === columnIndex && m.field === fieldName
            ? { ...m, field: null, subField: null, asDescriptor: false, descriptorKey: m.columnName, ignore: true }
            : m
        );
        return { ...e, mappings };
      })
    );
  }

  setFieldColumnSearch(fieldName: string, value: string) {
    this.fieldColumnSearch.update((s) => ({ ...s, [fieldName]: value }));
  }

  onFieldColumnPicked(fieldName: string, columnIndex: number) {
    this.setFieldColumn(fieldName, columnIndex);
    this.setFieldColumnSearch(fieldName, "");
  }

  getFieldConstant(fieldName: string): string {
    const m = this.activeMappings().find(
      (m) => m.field === fieldName && m.constantValue != null && String(m.constantValue).trim() !== ""
    );
    return m?.constantValue ?? "";
  }

  setFieldConstant(fieldName: string, value: string) {
    const en = this.activeEntityName();
    if (!en) return;
    const v = (value ?? "").trim();
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.field === fieldName ? { ...m, constantValue: v || null } : m
        );
        return { ...e, mappings };
      })
    );
  }

  // ─── Companion values (centro, cantidad, rol por columna) ───

  private patchCompanion(m: ColumnMapping, name: string, patch: Partial<{ columnIndex: number | null; constantValue: string | null }>): ColumnMapping {
    const list = [...(m.companionValues ?? [])];
    const idx = list.findIndex((c) => c.name === name);
    const cur = idx >= 0 ? list[idx] : { name, columnIndex: null, constantValue: null };
    const next = { ...cur, ...patch };
    if (idx >= 0) list[idx] = next;
    else list.push(next);
    return { ...m, companionValues: list };
  }

  getCompanionColumn(fieldName: string, name: string): number | null {
    const m = this.activeMappings().find((m) => m.field === fieldName && !m.ignore);
    return m?.companionValues?.find((c) => c.name === name)?.columnIndex ?? null;
  }

  getCompanionConstant(fieldName: string, name: string): string {
    const m = this.activeMappings().find((m) => m.field === fieldName && !m.ignore);
    return m?.companionValues?.find((c) => c.name === name)?.constantValue ?? "";
  }

  setCompanionColumn(fieldName: string, name: string, columnIndex: number | null) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.field === fieldName
            ? this.patchCompanion(m, name, { columnIndex, constantValue: null })
            : m
        );
        return { ...e, mappings };
      })
    );
  }

  setCompanionConstant(fieldName: string, name: string, value: string) {
    const en = this.activeEntityName();
    if (!en) return;
    const v = (value ?? "").trim();
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.field === fieldName
            ? this.patchCompanion(m, name, { columnIndex: null, constantValue: v || null })
            : m
        );
        return { ...e, mappings };
      })
    );
  }

  getFieldRol(fieldName: string): string | null {
    const m = this.activeMappings().find((m) => m.field === fieldName && !m.ignore);
    return m?.refRol ?? null;
  }

  setFieldRol(fieldName: string, rol: string | null) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.field === fieldName ? { ...m, refRol: rol || null } : m
        );
        return { ...e, mappings };
      })
    );
  }

  getFieldDelimiter(fieldName: string): string | null {
    const m = this.activeMappings().find((m) => m.field === fieldName && !m.ignore);
    return m?.delimiter ?? null;
  }

  setFieldDelimiter(fieldName: string, delimiter: string) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.field === fieldName ? { ...m, delimiter: delimiter || null } : m
        );
        return { ...e, mappings };
      })
    );
  }

  getGroupsForField(fieldName: string): CompoundRefGroup[] {
    const ec = this.importEntities().find((e) => e.entityName === this.activeEntityName());
    return (ec?.compoundRefGroups ?? []).filter((g) => g.refField === fieldName);
  }

  // ─── Autocomplete helpers for field column selectors ────────

  filteredFieldColumns(fieldName: string): { name: string; index: number }[] {
    const search = (this.fieldColumnSearch()[fieldName] || '').toLowerCase();
    return this.previewColumns().filter((col) =>
      !search || col.name.toLowerCase().includes(search)
    );
  }

  getFieldColumnLabel(fieldName: string): string {
    const idx = this.getFieldColumn(fieldName);
    if (idx === null) return '';
    return this.previewColumns().find((c) => c.index === idx)?.name ?? '';
  }

  onColumnSelectChange(fieldName: string, columnIndex: number | null) {
    this.setFieldColumn(fieldName, columnIndex);
  }

  // ─── Multi-column per subField (compound ref) ───────────────

  getSubFieldColumnIndices(grp: CompoundRefGroup, subFieldName: string): number[] {
    return grp.subMappings
      .filter((m) => m.subField === subFieldName)
      .map((m) => m.columnIndex);
  }

  setSubFieldColumns(grpId: string, subFieldName: string, columnIndices: number[]) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundRefGroups ?? []).map((g) => {
          if (g.id !== grpId) return g;
          const other = g.subMappings.filter((sm) => sm.subField !== subFieldName);
          const entries = columnIndices.map((ci) => ({ columnIndex: ci, subField: subFieldName }));
          return { ...g, subMappings: [...other, ...entries] };
        });
        return { ...e, compoundRefGroups: groups };
      })
    );
  }

  getGroupSubFieldsLabel(grp: CompoundRefGroup, subFieldName: string): string {
    const idxs = this.getSubFieldColumnIndices(grp, subFieldName);
    return idxs
      .map((i) => this.previewColumns().find((c) => c.index === i)?.name)
      .filter(Boolean)
      .join(', ');
  }

  isGroupSubFieldSelected(grp: CompoundRefGroup, subFieldName: string, columnIndex: number): boolean {
    return this.getSubFieldColumnIndices(grp, subFieldName).includes(columnIndex);
  }

  toggleGroupSubFieldColumn(grp: CompoundRefGroup, subFieldName: string, columnIndex: number, checked: boolean) {
    const current = this.getSubFieldColumnIndices(grp, subFieldName);
    const next = checked
      ? [...current, columnIndex]
      : current.filter((c) => c !== columnIndex);
    this.setSubFieldColumns(grp.id, subFieldName, next);
  }

  getSubFieldConstant(grp: CompoundRefGroup, subFieldName: string): string {
    return grp.subMappings.find(
      (sm) => sm.subField === subFieldName && sm.constantValue != null && String(sm.constantValue).trim() !== ""
    )?.constantValue ?? "";
  }

  setSubFieldConstant(grp: CompoundRefGroup, subFieldName: string, value: string) {
    const en = this.activeEntityName();
    if (!en) return;
    const v = (value ?? "").trim();
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundRefGroups ?? []).map((g) => {
          if (g.id !== grp.id) return g;
          let subMappings = g.subMappings.filter(
            (sm) => !(sm.subField === subFieldName && sm.constantValue != null && String(sm.constantValue).trim() !== "")
          );
          if (v) subMappings = [...subMappings, { subField: subFieldName, columnIndex: -1, constantValue: v }];
          return { ...g, subMappings };
        });
        return { ...e, compoundRefGroups: groups };
      })
    );
  }

  setGroupRol(grp: CompoundRefGroup, rol: string | null) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundRefGroups ?? []).map((g) =>
          g.id === grp.id ? { ...g, refRol: rol || null } : g
        );
        return { ...e, compoundRefGroups: groups };
      })
    );
  }

  removeCompoundGroupForField(fieldName: string, groupIndex: number) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundRefGroups ?? []).filter((g, i) => {
          if (g.refField !== fieldName) return true;
          const fieldGroups = (e.compoundRefGroups ?? []).filter((g2) => g2.refField === fieldName);
          const localIdx = fieldGroups.indexOf(g);
          return localIdx !== groupIndex;
        });
        return { ...e, compoundRefGroups: groups };
      })
    );
  }

  // ─── Step 2→3: Search all refs for ALL entities ─────────────

  irAReferencias() {
    const p = this.preview();
    if (!p) return;
    this.loading.set(true);
    this.error.set(null);

    let rows = p.rows;
    if (this.testMode()) {
      rows = this.testRows().length ? this.testRows() : [...p.rows].sort(() => Math.random() - 0.5).slice(0, 5);
    }

    const entities = this.importEntities();
    let completed = 0;

    for (const ec of entities) {
      this.service.searchAllRefs(ec.entityName, rows, ec.mappings, ec.compoundRefGroups).subscribe({
        next: (res) => {
          this.importEntities.update((list) =>
            list.map((e) =>
              e.entityName === ec.entityName
                ? { ...e, refResults: res.data, refResolutions: this.buildDefaultRefResolutions(res.data) }
                : e
            )
          );
          completed++;
          if (completed === entities.length) {
            this.loading.set(false);
            this.advanceStep();
          }
        },
        error: (err) => {
          completed++;
          if (completed === entities.length) {
            this.loading.set(false);
          }
          this.error.set(err.error?.message || err.message || `Error al buscar referencias en ${ec.label}`);
        },
      });
    }
  }

  private buildDefaultRefResolutions(refResults: RefSearchAllResult[]): Record<string, Record<string, RefResolution>> {
    const defaults: Record<string, Record<string, RefResolution>> = {};
    for (const refCol of refResults) {
      const resolutionKey = this.refResolutionKeyStatic(refCol);
      for (const uv of refCol.uniqueValues) {
        const key = uv.searchText;
        defaults[key] = defaults[key] || {};
        defaults[key][resolutionKey] = {
          action: uv.defaultAction,
          matchId: uv.defaultMatchId,
          matchLabel: uv.defaultAction === "use_existing" && uv.defaultMatchId
            ? (uv.matches.find((m: any) => m._id === uv.defaultMatchId)?.displayValue || key)
            : key,
        };
      }
    }
    return defaults;
  }

  // ─── Step 3: Ref resolution (per active entity) ─────────────

  isAutoLinkField(entityName: string, field: string): boolean {
    const ec = this.importEntities().find((e) => e.entityName === entityName);
    return !!ec?.autoLinks?.some((l) => l.field === field);
  }

  getActiveRefResolutions(): Record<string, Record<string, RefResolution>> {
    return this.activeEntity()?.refResolutions ?? {};
  }

  private refResolutionKeyStatic(refCol: RefSearchAllResult): string {
    if (refCol.isCompound) return 'comp_' + (refCol.compoundGroupId || refCol.field);
    return String(refCol.columnIndex);
  }

  private refResolutionKey(refCol: any): string {
    if (refCol.isCompound) return 'comp_' + (refCol.compoundGroupId || refCol.field);
    return String(refCol.columnIndex);
  }

  getActiveUniqueValueAction(refCol: any, searchText: string): "use_existing" | "create" | "skip" {
    return this.getActiveRefResolutions()?.[searchText]?.[this.refResolutionKey(refCol)]?.action ?? "use_existing";
  }

  getActiveUniqueValueMatchId(refCol: any, searchText: string): string | null {
    return this.getActiveRefResolutions()?.[searchText]?.[this.refResolutionKey(refCol)]?.matchId ?? null;
  }

  setActiveUniqueValueAction(refCol: any, uv: any, action: "use_existing" | "create" | "skip") {
    const en = this.activeEntityName();
    const resKey = this.refResolutionKey(refCol);
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const refRes = { ...e.refResolutions };
        const key = uv.searchText;
        const rowRes = { ...(refRes[key] || {}) };
        if (action === "create") {
          rowRes[resKey] = { action: "create", matchId: null, matchLabel: key };
        } else if (action === "skip") {
          rowRes[resKey] = { action: "skip", matchId: null, matchLabel: key };
        } else {
          const firstMatch = uv.matches?.[0];
          rowRes[resKey] = { action: "use_existing", matchId: firstMatch?._id ?? null, matchLabel: firstMatch?.displayValue ?? null };
        }
        refRes[key] = rowRes;
        return { ...e, refResolutions: refRes };
      })
    );
  }

  onActiveRefMatchSelect(refCol: any, uv: any, matchId: string) {
    this.setActiveUniqueValueMatchIdDirect(refCol, uv, matchId);
  }

  private setActiveUniqueValueMatchIdDirect(refCol: any, uv: any, matchId: string) {
    const en = this.activeEntityName();
    const resKey = this.refResolutionKey(refCol);
    const match = uv.matches?.find((m: any) => m._id === matchId);
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const refRes = { ...e.refResolutions };
        const key = uv.searchText;
        const rowRes = { ...(refRes[key] || {}) };
        rowRes[resKey] = { action: "use_existing", matchId, matchLabel: match?.displayValue ?? null };
        refRes[key] = rowRes;
        return { ...e, refResolutions: refRes };
      })
    );
  }

  getSearchKey(refCol: any, searchText: string): string {
    return `${this.refResolutionKey(refCol)}_${searchText}`;
  }

  onRefSearchChange(refCol: any, searchText: string, val: string) {
    const key = this.getSearchKey(refCol, searchText);
    this.refSearchTexts.update((r) => ({ ...r, [key]: val }));
  }

  getRefSearchResults(refCol: any, searchText: string): RefMatchItem[] | null {
    const key = this.getSearchKey(refCol, searchText);
    return this.refSearchResults()[key] || null;
  }

  buscarRef(refCol: any, uv: any) {
    const key = this.getSearchKey(refCol, uv.searchText);
    const searchText = this.refSearchTexts()[key]?.trim() || uv.searchText;
    if (!searchText) return;
    this.service.searchRef(refCol.refEntity, searchText).subscribe({
      next: (res) => {
        this.refSearchResults.update((r) => ({ ...r, [key]: res.data }));
      },
    });
  }

  selectRefFromSearch(refCol: any, uv: any, match: RefMatchItem) {
    const en = this.activeEntityName();
    const resKey = this.refResolutionKey(refCol);
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const refRes = { ...e.refResolutions };
        const key = uv.searchText;
        const rowRes = { ...(refRes[key] || {}) };
        rowRes[resKey] = { action: "use_existing", matchId: match._id, matchLabel: match.displayValue };
        refRes[key] = rowRes;
        return { ...e, refResolutions: refRes };
      })
    );
    const searchKey = this.getSearchKey(refCol, uv.searchText);
    this.refSearchResults.update((r) => ({ ...r, [searchKey]: [] }));
  }

  // ─── Template helpers ──────────────────────────────────────

  countMapped(mappings: ColumnMapping[]): number {
    return mappings.filter((m) => m.field).length;
  }

  countSelected(validationResults: RowValidation[]): number {
    return validationResults.filter((r) => r.selected).length;
  }

  isRefField(entityName: string | null, fieldName: string | null): boolean {
    if (!entityName || !fieldName) return false;
    const info = this.entityInfos().find((e) => e.name === entityName);
    return !!info?.fields.find((f) => f.name === fieldName)?.isRef;
  }

  // ─── Shared helpers ─────────────────────────────────────────

  private findCompoundGroup(col: ValidationColumn): CompoundObjectGroup | CompoundRefGroup | null {
    const ec = this.importEntities().find((e) => e.entityName === this.activeEntityName());
    if (!ec) return null;
    if (col.groupKind === "object") {
      return ec.compoundObjectGroups?.find((g) => g.id === col.groupId) ?? null;
    }
    return ec.compoundRefGroups?.find((g) => g.id === col.groupId) ?? null;
  }

  getValidationValue(v: RowValidation, col: ValidationColumn): string {
    if (col.kind === "sub") {
      const grp = this.findCompoundGroup(col);
      const sm = grp?.subMappings.find((s) => s.subField === col.subField);
      if (!sm) return "";
      if (sm.constantValue != null && String(sm.constantValue).trim() !== "") return sm.constantValue;
      if (sm.columnIndex == null || sm.columnIndex < 0) return "";
      const val = v.data?.[sm.columnIndex];
      return val != null ? String(val) : "";
    }
    const mapping = this.importEntities()
      .find((e) => e.entityName === col.entityName)
      ?.mappings.find((m) => m.field === col.field && !m.ignore);
    if (!mapping) return "";
    if (mapping.constantValue != null && String(mapping.constantValue).trim() !== "") return mapping.constantValue;
    const val = v.data?.[mapping.columnIndex];
    return val != null ? String(val) : "";
  }

  setValidationValue(v: RowValidation, col: ValidationColumn, value: string) {
    const en = this.activeEntityName();
    let colIdx: number | null = null;
    if (col.kind === "sub") {
      const grp = this.findCompoundGroup(col);
      const sm = grp?.subMappings.find((s) => s.subField === col.subField);
      if (!sm || (sm.constantValue != null && String(sm.constantValue).trim() !== "")) return;
      colIdx = (sm.columnIndex != null && sm.columnIndex >= 0) ? sm.columnIndex : null;
    } else {
      const mapping = this.importEntities()
        .find((e) => e.entityName === col.entityName)
        ?.mappings.find((m) => m.field === col.field && !m.ignore);
      if (!mapping || (mapping.constantValue != null && String(mapping.constantValue).trim() !== "")) return;
      colIdx = mapping.columnIndex;
    }
    if (colIdx == null) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        return {
          ...e,
          validationResults: e.validationResults.map((rv) =>
            rv.rowIndex === v.rowIndex
              ? { ...rv, data: { ...rv.data, [colIdx]: value } }
              : rv
          ),
        };
      })
    );
  }

  // ─── Fixed descriptors (no column needed) ──────────────────

  activeFixedDescriptors = computed<FixedDescriptor[]>(() => this.activeEntity()?.fixedDescriptors ?? []);

  addFixedDescriptor() {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) =>
        e.entityName === en
          ? { ...e, fixedDescriptors: [...(e.fixedDescriptors ?? []), { etiqueta: "", contenido: "" }] }
          : e
      )
    );
  }

  removeFixedDescriptor(index: number) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) =>
        e.entityName === en
          ? { ...e, fixedDescriptors: (e.fixedDescriptors ?? []).filter((_, i) => i !== index) }
          : e
      )
    );
  }

  setFixedDescriptor(index: number, prop: "etiqueta" | "contenido", value: string) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) =>
        e.entityName === en
          ? {
              ...e,
              fixedDescriptors: (e.fixedDescriptors ?? []).map((fd, i) =>
                i === index ? { ...fd, [prop]: value } : fd
              ),
            }
          : e
      )
    );
  }

  // ─── Step 3→4: Validate / Dedup for ALL entities ────────────

  irAValidar() {
    this.loading.set(true);
    this.error.set(null);
    const preview = this.preview();
    if (!preview) return;

    let rows = preview.rows;
    if (this.testMode()) {
      rows = this.testRows().length ? this.testRows() : [...preview.rows].sort(() => Math.random() - 0.5).slice(0, 5);
    }

    const entities = this.importEntities();
    let completed = 0;

    for (const ec of entities) {
      this.service.dedup({
        columns: preview.columns,
        rows,
        mappings: ec.mappings,
        entityName: ec.entityName,
      }).subscribe({
        next: (res) => {
          this.importEntities.update((list) =>
            list.map((e) =>
              e.entityName === ec.entityName ? { ...e, validationResults: res.data } : e
            )
          );
          completed++;
          if (completed === entities.length) {
            this.loading.set(false);
            this.advanceStep();
          }
        },
        error: (err) => {
          completed++;
          if (completed === entities.length) {
            this.loading.set(false);
          }
          this.error.set(err.error?.message || err.message || "Error al validar datos");
        },
      });
    }
  }

  // ─── Step 4: Validation pagination & selection ──────────────

  toggleAllRows(checked: boolean) {
    const start = this.pageStart();
    const end = this.pageEnd();
    const en = this.activeEntityName();
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const vr = e.validationResults.map((r, i) =>
          (i >= start && i < end) ? { ...r, selected: checked } : r
        );
        return { ...e, validationResults: vr };
      })
    );
  }

  switchValidationEntity(index: number) {
    this.activeEntityIndex.set(index);
    this.pageIndex.set(0);
  }

  onValidationCheckChange() {
    this.importEntities.update((list) => [...list]);
  }

  anyEntitySelected = computed(() =>
    this.allValidationResults().some((r) => r.selected)
  );

  irAConfirmar() {
    const selected = this.allValidationResults().filter((r) => r.selected);
    if (selected.length === 0) {
      this.sweetAlert.confirm(
        "¿Ninguna fila seleccionada para importar?",
        "No hay filas marcadas para importar en ninguna entidad. ¿Deseas continuar de todas formas?",
        "Sí, continuar",
        "Volver"
      ).then((result: any) => { if (result.isConfirmed) this.advanceStep(); });
    } else {
      this.advanceStep();
    }
  }

  // ─── Step 5: Execute multi-entity import ────────────────────

  ejecutarImportacion() {
    this.executing.set(true);
    this.error.set(null);
    const preview = this.preview();
    if (!preview) return;

    const execEntities: ExecuteEntityPayload[] = this.importEntities().map((ec) => {
      const actions: RowAction[] = ec.validationResults
        .filter((r) => r.selected)
        .map((r) => ({ rowIndex: r.rowIndex, rowAction: r.suggestedAction, matchId: r.matchId }));

      const uniqueRes = ec.refResolutions;
      const expandedRes: Record<number, Record<string, RefResolution>> = {};
      for (const refCol of ec.refResults) {
        const resKey = refCol.isCompound
          ? 'comp_' + (refCol.compoundGroupId || refCol.field)
          : String(refCol.columnIndex);
        for (const uv of refCol.uniqueValues) {
          const res = uniqueRes[uv.searchText]?.[resKey];
          if (res) {
            for (const ri of uv.rowIndices) {
              if (!expandedRes[ri]) expandedRes[ri] = {};
              const targetKey = refCol.isCompound
                ? 'comp_' + (refCol.compoundGroupId || refCol.field)
                : refCol.field;
              expandedRes[ri][targetKey] = { ...res };
            }
          }
        }
      }

      return {
        entityName: ec.entityName,
        mappings: ec.mappings,
        actions,
        refResolutions: expandedRes,
        autoLinks: ec.autoLinks,
        compoundRefGroups: ec.compoundRefGroups,
        compoundObjectGroups: ec.compoundObjectGroups,
        fixedDescriptors: ec.fixedDescriptors,
      };
    });

    // Merge edits made in the Validar step into the rows sent to the backend
    const rowMap = new Map<number, string[]>();
    for (const ec of this.importEntities()) {
      for (const rv of ec.validationResults) {
        rowMap.set(rv.rowIndex, rv.data);
      }
    }
    const baseRows = this.testMode() && this.testRows().length ? this.testRows() : preview.rows;
    const rows = baseRows.map((r, i) => rowMap.get(i) ?? r);

    this.service.execute({
      columns: preview.columns,
      rows,
      entities: execEntities,
    }).subscribe({
      next: (res) => {
        this.importLog.set(res.data.results);
        this.executedLogByEntity = res.data.entityResults || [];
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

  executedLogByEntity: { entityName: string; results: ImportResult[]; summary: any }[] = [];

  getActiveImportLog(): ImportResult[] {
    const en = this.activeEntityName();
    if (!en) return this.importLog();
    const group = this.executedLogByEntity.find((g) => g.entityName === en);
    return group?.results ?? this.importLog().filter((r) => r.message.startsWith(`[${en}]`));
  }

  abrirDetalle(v: RowValidation) {
    if (v.matchId) {
      const en = this.activeEntityName()?.toLowerCase() || "";
      const routes: Record<string, string> = {
        obra: "/obras", actor: "/actores", recurso: "/recursos",
        instrumento: "/instrumentos", sistema: "/sistemas", medio: "/medios",
        genero: "/generos", generonomusical: "/generos-no-musicales",
        materia: "/materias", fondo: "/fondos", coleccion: "/colecciones",
        proyecto: "/proyectos", idioma: "/idiomas", ejemplar: "/ejemplares",
        diccionario: "/diccionarios",
      };
      const base = routes[en] || `/${en}`;
      window.open(`#${base}/${v.matchId}`, "_blank");
    }
  }

  advanceStep() {
    const s = this.step();
    const next = Math.min(s + 1, 5);
    this.step.set(next);
    const status = [...this.stepStatus()];
    status[s] = "completed";
    if (next <= 5) status[next] = "active";
    this.stepStatus.set(status);
  }

  // ─── Compound object groups ────────────────────────────────

  getCompoundGroupsForField(fieldName: string): CompoundObjectGroup[] {
    const ec = this.importEntities().find((e) => e.entityName === this.activeEntityName());
    return (ec?.compoundObjectGroups ?? []).filter((g) => g.field === fieldName);
  }

  addCompoundObjectGroup(fieldName: string) {
    const en = this.activeEntityName();
    if (!en || !fieldName) return;
    const grp: CompoundObjectGroup = {
      id: 'cog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      entityName: en,
      field: fieldName,
      subMappings: [],
    };
    this.importEntities.update((list) =>
      list.map((e) =>
        e.entityName === en
          ? { ...e, compoundObjectGroups: [...(e.compoundObjectGroups ?? []), grp] }
          : e
      )
    );
  }

  removeCompoundObjectGroup(fieldName: string, groupIndex: number) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundObjectGroups ?? []).filter((g, i) => {
          if (g.field !== fieldName) return true;
          const fieldGroups = (e.compoundObjectGroups ?? []).filter((g2) => g2.field === fieldName);
          const localIdx = fieldGroups.indexOf(g);
          return localIdx !== groupIndex;
        });
        return { ...e, compoundObjectGroups: groups };
      })
    );
  }

  getCompoundSubFieldColumnIndices(grp: CompoundObjectGroup, subFieldName: string): number[] {
    return grp.subMappings
      .filter((m) => m.subField === subFieldName)
      .map((m) => m.columnIndex);
  }

  setCompoundSubFieldColumns(grpId: string, subFieldName: string, columnIndices: number[]) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundObjectGroups ?? []).map((g) => {
          if (g.id !== grpId) return g;
          const other = g.subMappings.filter((sm) => sm.subField !== subFieldName);
          const entries = columnIndices.map((ci) => ({ columnIndex: ci, subField: subFieldName }));
          return { ...g, subMappings: [...other, ...entries] };
        });
        return { ...e, compoundObjectGroups: groups };
      })
    );
  }

  getCompoundObjectSubFieldsLabel(grp: CompoundObjectGroup, subFieldName: string): string {
    const idxs = this.getCompoundSubFieldColumnIndices(grp, subFieldName);
    return idxs
      .map((i) => this.previewColumns().find((c) => c.index === i)?.name)
      .filter(Boolean)
      .join(', ');
  }

  isCompoundObjectSubFieldSelected(grp: CompoundObjectGroup, subFieldName: string, columnIndex: number): boolean {
    return this.getCompoundSubFieldColumnIndices(grp, subFieldName).includes(columnIndex);
  }

  toggleCompoundObjectSubFieldColumn(grp: CompoundObjectGroup, subFieldName: string, columnIndex: number, checked: boolean) {
    const current = this.getCompoundSubFieldColumnIndices(grp, subFieldName);
    const next = checked
      ? [...current, columnIndex]
      : current.filter((c) => c !== columnIndex);
    this.setCompoundSubFieldColumns(grp.id, subFieldName, next);
  }

  getCompoundSubFieldConstant(grp: CompoundObjectGroup, subFieldName: string): string {
    return grp.subMappings.find(
      (sm) => sm.subField === subFieldName && sm.constantValue != null && String(sm.constantValue).trim() !== ""
    )?.constantValue ?? "";
  }

  setCompoundSubFieldConstant(grp: CompoundObjectGroup, subFieldName: string, value: string) {
    const en = this.activeEntityName();
    if (!en) return;
    const v = (value ?? "").trim();
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const groups = (e.compoundObjectGroups ?? []).map((g) => {
          if (g.id !== grp.id) return g;
          let subMappings = g.subMappings.filter(
            (sm) => !(sm.subField === subFieldName && sm.constantValue != null && String(sm.constantValue).trim() !== "")
          );
          if (v) subMappings = [...subMappings, { subField: subFieldName, columnIndex: -1, constantValue: v }];
          return { ...g, subMappings };
        });
        return { ...e, compoundObjectGroups: groups };
      })
    );
  }

  // ─── Descriptor step helpers ───────────────────────────────

  activeEntityUnmappedColumns = computed(() => {
    const cols = this.previewColumns();
    const en = this.activeEntityName();
    if (!en) return [];
    const ec = this.importEntities().find((e) => e.entityName === en);
    if (!ec) return [];
    return cols.filter((col) => {
      const m = ec.mappings.find((m) => m.columnIndex === col.index);
      return !m || !m.field;
    }).map((col) => ({
      ...col,
      example: this.getColumnExample(col.index),
    }));
  });

  getColumnExample(columnIndex: number): string {
    const p = this.preview();
    if (!p) return '';
    for (const row of p.rows) {
      const val = row[columnIndex];
      if (val != null && String(val).trim() !== '') return String(val).trim();
    }
    return '';
  }

  isDescriptorIgnored(columnIndex: number): boolean {
    const m = this.activeMappings().find((m) => m.columnIndex === columnIndex);
    return m ? m.ignore : true;
  }

  toggleDescriptorColumn(columnIndex: number, useAsDescriptor: boolean) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.columnIndex === columnIndex
            ? { ...m, asDescriptor: useAsDescriptor, ignore: !useAsDescriptor, descriptorKey: useAsDescriptor ? (m.descriptorKey || m.columnName) : m.columnName }
            : m
        );
        return { ...e, mappings };
      })
    );
  }

  getDescriptorKey(columnIndex: number): string {
    const m = this.activeMappings().find((m) => m.columnIndex === columnIndex);
    return m?.descriptorKey || m?.columnName || '';
  }

  setDescriptorKey(columnIndex: number, key: string) {
    const en = this.activeEntityName();
    if (!en) return;
    this.importEntities.update((list) =>
      list.map((e) => {
        if (e.entityName !== en) return e;
        const mappings = e.mappings.map((m) =>
          m.columnIndex === columnIndex ? { ...m, descriptorKey: key } : m
        );
        return { ...e, mappings };
      })
    );
  }

  // ─── Compound ref groups ────────────────────────────────────

  addCompoundGroup(refField: string) {
    const en = this.activeEntityName();
    if (!en || !refField) return;
    const grp: CompoundRefGroup = {
      id: 'crg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      entityName: en,
      refField: refField,
      subMappings: [],
      refRol: null,
    };
    this.importEntities.update((list) =>
      list.map((e) =>
        e.entityName === en
          ? { ...e, compoundRefGroups: [...(e.compoundRefGroups ?? []), grp] }
          : e
      )
    );
  }

  filteredRoles(query: string): string[] {
    return this.roles().filter((r) => r.toLowerCase().includes(query.toLowerCase()));
  }
}

