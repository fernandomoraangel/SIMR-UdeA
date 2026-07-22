import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { MediosStore } from '../../../state/medios.store';
import { MediosService } from '../../../data/medios.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ListEditorComponent } from '../../../../../shared/list-editor/list-editor.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { AnotacionCartograficoTemporal, toDisplayFecha } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import {
  VinculoRelacionadoEditorComponent,
  VinculoRelacionado,
} from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import {
  DescriptorLibreEditorComponent,
  DescriptorLibre,
} from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import { CreateMedioRequest, UpdateMedioRequest } from '../../../domain/medio.interface';

@Component({
  selector: 'app-medio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    CollapsibleSectionComponent,
    ListEditorComponent,
    AutocompleteCreateComponent,
    AnotacionesCartograficasComponent,
    VinculoRelacionadoEditorComponent,
    DescriptorLibreEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [MediosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Medio Sonoro' : 'Nuevo Medio Sonoro' }}</h1>
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

      <mat-card class="medio-form" appearance="outlined">
        <form [formGroup]="medioForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <div class="field-with-help">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Nombre del medio sonoro *</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Dueto vocal" />
                @if (isFieldInvalid('nombre')) {
                  <mat-error>El nombre es obligatorio</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <app-collapsible-section title="Nombres alternativos (alias)" icon="alternate_email" [collapsed]="true">
            <div class="section-content">
              <app-list-editor
                [value]="aliasStrings"
                placeholder="Ej: Dueto vocal"
                (valueChange)="aliasStrings = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Instrumentos" icon="music_note" [collapsed]="false">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Instrumento</mat-label>
                  <mat-select [formControl]="instrumentoControl">
                    @for (inst of instrumentos(); track inst._id) {
                      <mat-option [value]="inst._id">{{ inst.nombre }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="campo-corto" subscriptSizing="dynamic">
                  <mat-label>Cantidad</mat-label>
                  <input matInput type="number" [formControl]="cantidadControl" min="1" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="campo-medio" subscriptSizing="dynamic">
                  <mat-label>Rol</mat-label>
                  <mat-select [formControl]="rolControl">
                    @for (r of rolesMedios(); track r) {
                      <mat-option [value]="r">{{ r }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addInstrumento()" [disabled]="!instrumentoControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (instrumentosItems.length > 0) {
                <div class="items-list">
                  @for (inst of instrumentosItems; track $index) {
                    <div class="instrumento-item">
                      <span class="instrumento-nombre">{{ getInstrumentoNombre(inst.instrumento) }}</span>
                      <span class="instrumento-detalle">× {{ inst.cantidad }} — {{ inst.rol }}</span>
                      <button mat-icon-button (click)="removeInstrumento($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay instrumentos agregados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Proyectos asociados" icon="assignment" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="proyectos"
                placeholder="Buscar proyecto..."
                [selected]="proyectosItems"
                (selectedChange)="proyectosItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map" [collapsed]="true">
            <div class="section-content">
              <app-anotaciones-cartograficas
                [anotaciones]="anotacionesItems"
                [lugares]="lugares()"
                [coberturas]="coberturas()"
                (anotacionesChange)="anotacionesItems = $event"
              />
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

          <app-collapsible-section title="Enlaces y archivos" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-vinculo-relacionado-editor
                [vinculos]="vinculoItems"
                (vinculosChange)="vinculoItems = $event"
              />

              <div class="archivos-section">
                <h4 class="subtitulo">Archivos</h4>
                <app-archivo-manager
                  [documentId]="documentId()"
                  collection="medios"
                  (fileUploaded)="onFileUploaded($event)"
                  (fileDeleted)="onFileDeleted($event)"
                />
              </div>
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="medioForm.invalid || store.isLoading()">
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
    .medio-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .field-with-help { display: flex; align-items: flex-start; gap: 0.25rem; }
    .field-with-help .campo { flex: 1; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; }
    .inline-editor { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.5rem; margin-bottom: 0.75rem; }
    .campo-corto { width: 100px; }
    .campo-medio { width: 200px; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .instrumento-item {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline);
      border-radius: 8px; padding: 0.5rem 0.75rem; transition: border-color 0.2s;
    }
    .instrumento-item:hover { border-color: var(--simr-cobre); }
    .instrumento-nombre { font-weight: 600; font-size: 0.9rem; color: var(--simr-tinta); min-width: 160px; }
    .instrumento-detalle { flex: 1; font-size: 0.85rem; color: var(--simr-tinta-2); }
    .empty-hint {
      font-size: 0.82rem; color: var(--simr-tinta-2); text-align: center;
      padding: 0.75rem; background: var(--simr-hueso); border-radius: 8px;
      border: 1px dashed var(--mat-sys-outline); margin: 0.5rem 0;
    }
    .archivos-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--mat-sys-outline); }
    .subtitulo { margin: 0 0 0.75rem; font-size: 0.88rem; color: var(--simr-tinta); font-weight: 600; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
      .inline-editor { flex-direction: column; align-items: stretch; }
      .campo-corto, .campo-medio { width: 100%; }
    }
  `],
})
export class MedioFormComponent implements OnInit {
  protected readonly store = inject(MediosStore);
  private readonly mediosService = inject(MediosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected medioId: string | null = null;

  protected aliasStrings: string[] = [];
  protected instrumentosItems: any[] = [];
  protected proyectosItems: any[] = [];
  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected instrumentos = signal<any[]>([]);
  protected rolesMedios = signal<string[]>([]);
  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected documentId = signal<string>('');

  // Form controls for inline instrumento editor
  protected instrumentoControl = this.fb.control<string | null>(null);
  protected cantidadControl = this.fb.control<number | null>(null);
  protected rolControl = this.fb.control<string | null>(null);

  // Main form
  medioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const medio = this.store.selectedMedio();
      if (medio && this.isEditMode) {
        this.loadMedioData(medio);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.medioId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadMedioById(id);
        // Fallback directo por si el store tarda
        this.http.get(`${environment.apiUrl}/medios/${id}`).subscribe({
          next: (medio: any) => {
            console.log('[MedioForm] datos recibidos:', medio);
            this.loadMedioData(medio);
          },
          error: (err) => console.error('[MedioForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/instrumentos`).subscribe({
      next: (data: any) => this.instrumentos.set(Array.isArray(data) ? data : data?.data || []),
      error: () => this.instrumentos.set([]),
    });
    this.http.get(`${apiUrl}/listas/rolesMedios`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.rolesMedios.set(Array.isArray(list) ? list : []);
      },
      error: () => this.rolesMedios.set([]),
    });
    this.http.get(`${apiUrl}/listas/lugares`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.lugares.set(Array.isArray(list) ? list : []);
      },
      error: () => this.lugares.set([]),
    });
    this.http.get(`${apiUrl}/listas/coberturas`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.coberturas.set(Array.isArray(list) ? list : []);
      },
      error: () => this.coberturas.set([]),
    });
  }

  private loadMedioData(medio: any) {
    this.medioForm.patchValue({ nombre: medio.nombre || '' });
    this.aliasStrings = (medio.alias || []).map((a: any) => (typeof a === 'string' ? a : a.nombre));
    this.instrumentosItems = medio.instrumentos || [];
    this.proyectosItems = (medio.proyectosAsociados || []).map((p: any) => {
      const proy = p.proyecto || p;
      if (typeof proy === 'object') return { _id: proy._id, nombre: proy.nombre };
      return { _id: proy, nombre: '(cargando...)' };
    });
    this.anotacionesItems = (medio.anotacionCartograficoTemporal || []).map((a: any) => ({
      ...a,
      fechaInicio: a.fechaInicio ? toDisplayFecha(a.fechaInicio) : undefined,
      fechaFin: a.fechaFin ? toDisplayFecha(a.fechaFin) : undefined,
    }));
    this.descriptorItems = medio.descriptorLibre || [];
    this.vinculoItems = medio.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (medio.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.medioForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected addInstrumento() {
    const inst = this.instrumentoControl.value;
    const cant = this.cantidadControl.value || 1;
    const rol = this.rolControl.value || '';
    if (!inst) return;
    this.instrumentosItems = [...this.instrumentosItems, { instrumento: inst, cantidad: cant, rol }];
    this.instrumentoControl.reset();
    this.cantidadControl.reset();
    this.rolControl.reset();
  }

  protected removeInstrumento(index: number) {
    this.instrumentosItems = this.instrumentosItems.filter((_, i) => i !== index);
  }

  protected getInstrumentoNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const inst = this.instrumentos().find((i) => i._id === ref);
    return inst?.nombre || `(cargando…)`;
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
    if (this.medioForm.invalid) return;

    const payload: any = {
      nombre: this.medioForm.value.nombre,
      alias: this.aliasStrings.map((s) => ({ nombre: s })),
      instrumentos: this.instrumentosItems,
      proyectosAsociados: this.proyectosItems.map((p) => ({ proyecto: p._id })),
      anotacionCartograficoTemporal: this.anotacionesItems,
      descriptorLibre: this.descriptorItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.medioId) {
      this.mediosService.update(this.medioId, payload).subscribe({
        next: () => this.router.navigate(['/medios', this.medioId]),
        error: (err) => {
          console.error('[MedioForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el medio');
        },
      });
    } else {
      this.mediosService.create(payload).subscribe({
        next: () => this.router.navigate(['/medios']),
        error: (err) => {
          console.error('[MedioForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el medio');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/medios']);
  }
}