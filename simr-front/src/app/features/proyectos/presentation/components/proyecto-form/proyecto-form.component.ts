import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@env/environment';
import { ProyectosStore } from '../../../state/proyectos.store';
import { ProyectosService } from '../../../data/proyectos.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { DescriptorLibreEditorComponent, DescriptorLibre } from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { VinculoRelacionadoEditorComponent, VinculoRelacionado } from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import { Investigador, FechaAsociada } from '../../../domain/proyecto.interface';

const PRECISION_OPTIONS = ['Año', 'Mes', 'Día', 'Hora'];
const PRECISION_DATE_OPTIONS = ['Año', 'Mes', 'Día'];

@Component({
  selector: 'app-proyecto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
    DescriptorLibreEditorComponent,
    VinculoRelacionadoEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [ProyectosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h1>
      </header>

      @if (store.isLoading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
      }

      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }

      <mat-card class="proyecto-form" appearance="outlined">
        <form [formGroup]="proyectoForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre del proyecto *</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Proyecto de investigación" />
              @if (isFieldInvalid('nombre')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Estado</mat-label>
              <input matInput formControlName="estado" [matAutocomplete]="estadoAuto" placeholder="Buscar estado..." />
              <mat-autocomplete #estadoAuto="matAutocomplete">
                @for (e of filteredEstados(); track e) {
                  <mat-option [value]="e">{{ e }}</mat-option>
                }
                @if (filteredEstados().length === 0 && proyectoForm.get('estado')?.value?.trim()) {
                  <mat-option disabled><span class="no-result">Sin resultados</span></mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
          </div>

          <app-collapsible-section title="Investigadores" icon="people" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Investigador</mat-label>
                  <input matInput [matAutocomplete]="autoActor" [formControl]="actorControl" placeholder="Escriba el nombre..." />
                  <mat-autocomplete #autoActor="matAutocomplete" (optionSelected)="onActorSelect($event)" [displayWith]="displayActorFn">
                    @for (a of filteredActores(); track a._id) {
                      <mat-option [value]="a">{{ a.nombre }}</mat-option>
                    }
                    @if (filteredActores().length === 0 && actorControl.value && typeof actorControl.value === 'string') {
                      <mat-option disabled>Sin resultados</mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Rol</mat-label>
                  <input matInput [formControl]="rolControl" placeholder="Ej: Investigador principal" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-fecha">
                  <mat-label>Activo desde</mat-label>
                  <input matInput [matDatepicker]="pickerDesde" [formControl]="activoDesdeControl" />
                  <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                  <mat-datepicker #pickerDesde></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-precision">
                  <mat-label>Precisión</mat-label>
                  <mat-select [formControl]="precisionActivoDesdeControl">
                    <mat-option value="">—</mat-option>
                    @for (p of precisionDateOptions; track p) {
                      <mat-option [value]="p">{{ p }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-fecha">
                  <mat-label>Activo hasta</mat-label>
                  <input matInput [matDatepicker]="pickerHasta" [formControl]="activoHastaControl" />
                  <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                  <mat-datepicker #pickerHasta></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-precision">
                  <mat-label>Precisión</mat-label>
                  <mat-select [formControl]="precisionActivoHastaControl">
                    <mat-option value="">—</mat-option>
                    @for (p of precisionDateOptions; track p) {
                      <mat-option [value]="p">{{ p }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addInvestigador()" [disabled]="!actorControl.value || typeof actorControl.value === 'string'">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (investigadoresItems.length > 0) {
                <div class="items-list">
                  @for (inv of investigadoresItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ inv.nombre || getActorNombre(inv.id) }}</span>
                      <span class="rel-detalle">{{ inv.rol }}</span>
                      @if (inv.activoDesde) {
                        <span class="rel-detalle">{{ inv.activoDesde | date:'dd/MM/yyyy' }}{{ inv.precisionActivoDesde ? ' (' + inv.precisionActivoDesde + ')' : '' }}</span>
                      }
                      @if (inv.activoHasta) {
                        <span class="rel-detalle">→ {{ inv.activoHasta | date:'dd/MM/yyyy' }}{{ inv.precisionActivoHasta ? ' (' + inv.precisionActivoHasta + ')' : '' }}</span>
                      }
                      <button mat-icon-button (click)="removeInvestigador($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay investigadores registrados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Fechas asociadas" icon="event" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-fecha">
                  <mat-label>Fecha *</mat-label>
                  <input matInput [matDatepicker]="pickerFecha" [formControl]="fechaControl" />
                  <mat-datepicker-toggle matSuffix [for]="pickerFecha"></mat-datepicker-toggle>
                  <mat-datepicker #pickerFecha></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Evento</mat-label>
                  <input matInput [formControl]="eventoControl" placeholder="Ej: Inicio del proyecto" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-precision">
                  <mat-label>Precisión</mat-label>
                  <mat-select [formControl]="precisionFechaControl">
                    <mat-option value="">—</mat-option>
                    @for (p of precisionOptions; track p) {
                      <mat-option [value]="p">{{ p }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addFechaAsociada()" [disabled]="!fechaControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (fechasAsociadasItems.length > 0) {
                <div class="items-list">
                  @for (f of fechasAsociadasItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ f.fecha | date:'dd/MM/yyyy' }}</span>
                      <span class="rel-detalle">{{ f.evento }}</span>
                      <span class="rel-detalle">{{ f.precision }}</span>
                      <button mat-icon-button (click)="removeFechaAsociada($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay fechas asociadas.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Descriptores libres" icon="label" [collapsed]="true">
            <div class="section-content">
              <app-descriptor-libre-editor
                [descriptores]="descriptorItems"
                (descriptoresChange)="descriptorItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Enlaces" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-vinculo-relacionado-editor
                [vinculos]="vinculoItems"
                (vinculosChange)="vinculoItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attach_file" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="documentId()"
                collection="proyectos"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
              />
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="proyectoForm.invalid || store.isLoading()">
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
    .form-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .form-header h1 { margin: 0; }
    .volver { color: var(--simr-musgo); }
    .loading-bar { margin-bottom: 1rem; }
    .proyecto-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; }
    .inline-editor { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.5rem; margin-bottom: 0.75rem; }
    .campo-largo { flex: 1; min-width: 160px; }
    .campo-medio { width: 180px; }
    .campo-fecha { width: 150px; }
    .campo-precision { width: 120px; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .rel-item {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline);
      border-radius: 8px; padding: 0.5rem 0.75rem; transition: border-color 0.2s;
    }
    .rel-item:hover { border-color: var(--simr-cobre); }
    .rel-nombre { font-weight: 600; font-size: 0.9rem; color: var(--simr-tinta); min-width: 140px; }
    .rel-detalle { flex: 1; font-size: 0.85rem; color: var(--simr-tinta-2); }
    .empty-hint {
      font-size: 0.82rem; color: var(--simr-tinta-2); text-align: center;
      padding: 0.75rem; background: var(--simr-hueso); border-radius: 8px;
      border: 1px dashed var(--mat-sys-outline); margin: 0.5rem 0;
    }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
      .inline-editor { flex-direction: column; align-items: stretch; }
      .campo-largo, .campo-medio, .campo-fecha, .campo-precision { width: 100%; }
    }
  `],
})
export class ProyectoFormComponent implements OnInit {
  protected readonly store = inject(ProyectosStore);
  private readonly proyectosService = inject(ProyectosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected proyectoId: string | null = null;

  protected precisionOptions = PRECISION_OPTIONS;
  protected precisionDateOptions = PRECISION_DATE_OPTIONS;

  protected investigadoresItems: Investigador[] = [];
  protected fechasAsociadasItems: FechaAsociada[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected actores = signal<any[]>([]);
  protected estados = signal<string[]>([]);
  protected filteredEstados = signal<string[]>([]);
  protected filteredActores = signal<any[]>([]);
  protected documentId = signal<string>('');

  protected actorControl = this.fb.control<any>(null);
  protected rolControl = this.fb.control<string>('');
  protected activoDesdeControl = this.fb.control<string | null>(null);
  protected precisionActivoDesdeControl = this.fb.control<string>('');
  protected activoHastaControl = this.fb.control<string | null>(null);
  protected precisionActivoHastaControl = this.fb.control<string>('');
  protected fechaControl = this.fb.control<string | null>(null);
  protected eventoControl = this.fb.control<string>('');
  protected precisionFechaControl = this.fb.control<string>('');

  proyectoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    estado: [''],
  });

  constructor() {
    effect(() => {
      const proyecto = this.store.selectedProyecto();
      if (proyecto && this.isEditMode) {
        this.loadProyectoData(proyecto);
      }
    });

    this.actorControl.valueChanges.subscribe((val) => {
      if (typeof val === 'string') {
        const term = val.toLowerCase().trim();
        this.filteredActores.set(
          this.actores().filter((a: any) =>
            a.nombre.toLowerCase().includes(term) && !this.investigadoresItems.find((i) => i.id === a._id)
          )
        );
      }
    });

    this.proyectoForm.get('estado')?.valueChanges.subscribe((val) => {
      const term = (val || '').toLowerCase().trim();
      this.filteredEstados.set(
        this.estados().filter((e) => e.toLowerCase().includes(term))
      );
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.proyectoId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/proyectos/${id}`).subscribe({
          next: (proyecto: any) => {
            this.loadProyectoData(proyecto);
          },
          error: (err) => console.error('[ProyectoForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/actores?select=nombre`).subscribe({
      next: (data: any) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        this.actores.set(items);
        this.filteredActores.set(items);
      },
      error: () => this.actores.set([]),
    });
    this.http.get(`${apiUrl}/listas/estadosProyectos`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        const arr = Array.isArray(list) ? list : [];
        this.estados.set(arr);
        this.filteredEstados.set(arr);
      },
      error: () => {
        this.estados.set([]);
        this.filteredEstados.set([]);
      },
    });
  }

  private loadProyectoData(proyecto: any) {
    this.proyectoForm.patchValue({ nombre: proyecto.nombre || '', estado: proyecto.estado || '' });
    this.investigadoresItems = (proyecto.investigadores || []).map((inv: any) => ({
      ...inv,
      id: inv.id || inv._id,
    }));
    this.fechasAsociadasItems = proyecto.fechasAsociadas || [];
    this.descriptorItems = proyecto.descriptoresLibres || [];
    this.vinculoItems = proyecto.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (proyecto.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected displayActorFn(actor: any): string {
    return actor?.nombre || '';
  }

  protected onActorSelect(event: MatAutocompleteSelectedEvent) {
    const actor = event.option.value;
    this.actorControl.setValue(actor);
  }

  protected getActorNombre(id: string): string {
    if (!id) return '';
    const found = this.actores().find((a: any) => a._id === id);
    return found?.nombre || '(cargando…)';
  }

  protected addInvestigador() {
    const actor = this.actorControl.value;
    if (!actor || typeof actor === 'string') return;
    const inv: Investigador = {
      id: actor._id,
      nombre: actor.nombre,
      rol: this.rolControl.value || '',
      activoDesde: this.activoDesdeControl.value || undefined,
      precisionActivoDesde: this.precisionActivoDesdeControl.value || undefined,
      activoHasta: this.activoHastaControl.value || undefined,
      precisionActivoHasta: this.precisionActivoHastaControl.value || undefined,
    };
    this.investigadoresItems = [...this.investigadoresItems, inv];
    this.actorControl.reset();
    this.rolControl.reset();
    this.activoDesdeControl.reset();
    this.precisionActivoDesdeControl.reset();
    this.activoHastaControl.reset();
    this.precisionActivoHastaControl.reset();
  }

  protected removeInvestigador(index: number) {
    this.investigadoresItems = this.investigadoresItems.filter((_, i) => i !== index);
  }

  protected addFechaAsociada() {
    const fecha = this.fechaControl.value;
    if (!fecha) return;
    const fa: FechaAsociada = {
      fecha,
      evento: this.eventoControl.value || '',
      precision: this.precisionFechaControl.value || '',
    };
    this.fechasAsociadasItems = [...this.fechasAsociadasItems, fa];
    this.fechaControl.reset();
    this.eventoControl.reset();
    this.precisionFechaControl.reset();
  }

  protected removeFechaAsociada(index: number) {
    this.fechasAsociadasItems = this.fechasAsociadasItems.filter((_, i) => i !== index);
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.proyectoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onFileUploaded(file: FileBasicInfo) {
    if (!this.archivosAdjuntosItems.find((f) => f.archivoId === file.id)) {
      this.archivosAdjuntosItems = [...this.archivosAdjuntosItems, { archivoId: file.id }];
    }
  }

  protected onFileDeleted(file: FileDeleteInfo) {
    this.archivosAdjuntosItems = this.archivosAdjuntosItems.filter((f) => f.archivoId !== file.id);
  }

  protected onSubmit() {
    if (this.proyectoForm.invalid) return;

    const payload: any = {
      nombre: this.proyectoForm.value.nombre,
      estado: this.proyectoForm.value.estado || '',
      investigadores: this.investigadoresItems,
      fechasAsociadas: this.fechasAsociadasItems,
      descriptoresLibres: this.descriptorItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.proyectoId) {
      this.proyectosService.update(this.proyectoId, payload).subscribe({
        next: () => this.router.navigate(['/proyectos', this.proyectoId]),
        error: (err) => {
          console.error('[ProyectoForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el proyecto');
        },
      });
    } else {
      this.proyectosService.create(payload).subscribe({
        next: () => this.router.navigate(['/proyectos']),
        error: (err) => {
          console.error('[ProyectoForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el proyecto');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/proyectos']);
  }
}
