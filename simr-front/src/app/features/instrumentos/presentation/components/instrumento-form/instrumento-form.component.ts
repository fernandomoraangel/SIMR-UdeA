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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { InstrumentosStore } from '../../../state/instrumentos.store';
import { InstrumentosService } from '../../../data/instrumentos.service';
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
import { HsClassificationService } from '../../../../../shared/hs-classification/hs-classification.service';
import { HsWizardComponent } from '../../../../../shared/hs-classification/hs-wizard.component';
import { CreateInstrumentoRequest, UpdateInstrumentoRequest } from '../../../domain/instrumento.interface';

@Component({
  selector: 'app-instrumento-form',
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
    MatDialogModule,
    CollapsibleSectionComponent,
    ListEditorComponent,
    AutocompleteCreateComponent,
    AnotacionesCartograficasComponent,
    VinculoRelacionadoEditorComponent,
    DescriptorLibreEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [InstrumentosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Instrumento' : 'Nuevo Instrumento' }}</h1>
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

      <mat-card class="inst-form" appearance="outlined">
        <form [formGroup]="instrumentoForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre del instrumento *</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Guitarra" (blur)="onNombreBlur()" />
              @if (isFieldInvalid('nombre')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>

            <div class="hs-field">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Clasificación Hornbostel-Sachs</mat-label>
                <input matInput formControlName="clasificacion" placeholder="Ej: 321.322" />
              </mat-form-field>
              <button
                mat-stroked-button
                type="button"
                (click)="openHsWizard()"
                class="hs-btn"
                matTooltip="Abrir clasificador Hornbostel-Sachs"
              >
                <mat-icon>account_tree</mat-icon>
                Clasificar
              </button>
              @if (hsName()) {
                <span class="hs-name-hint">{{ hsName() }}</span>
              }
            </div>
          </div>

          <app-collapsible-section title="Nombres alternativos (alias)" icon="alternate_email" [collapsed]="true">
            <div class="section-content">
              <app-list-editor
                [value]="aliasStrings"
                placeholder="Ej: violão"
                (valueChange)="aliasStrings = $event"
              />
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
                  collection="instrumentos"
                  (fileUploaded)="onFileUploaded($event)"
                  (fileDeleted)="onFileDeleted($event)"
                />
              </div>
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="instrumentoForm.invalid || store.isLoading()">
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
    .inst-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .hs-field { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .hs-field .campo { flex: 1; min-width: 200px; }
    .hs-btn { white-space: nowrap; }
    .hs-name-hint { font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; color: var(--simr-musgo); background: var(--simr-hueso); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid var(--mat-sys-outline); }
    .section-content { padding: 0.5rem 0; }
    .archivos-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--mat-sys-outline); }
    .subtitulo { margin: 0 0 0.75rem; font-size: 0.88rem; color: var(--simr-tinta); font-weight: 600; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
      .hs-field { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class InstrumentoFormComponent implements OnInit {
  protected readonly store = inject(InstrumentosStore);
  private readonly instrumentosService = inject(InstrumentosService);
  private readonly hsService = inject(HsClassificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected instrumentoId: string | null = null;

  protected aliasStrings: string[] = [];
  protected proyectosItems: any[] = [];
  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected documentId = signal<string>('');
  protected hsName = signal<string | null>(null);

  instrumentoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    clasificacion: [''],
  });

  constructor() {
    effect(() => {
      const inst = this.store.selectedInstrumento();
      if (inst && this.isEditMode) {
        this.loadInstrumentoData(inst);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.instrumentoId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadInstrumentoById(id);
        this.http.get(`${environment.apiUrl}/instrumentos/${id}`).subscribe({
          next: (inst: any) => this.loadInstrumentoData(inst),
          error: (err) => console.error('[InstrumentoForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
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

  private loadInstrumentoData(inst: any) {
    this.instrumentoForm.patchValue({
      nombre: inst.nombre || '',
      clasificacion: inst.clasificacion || '',
    });
    this.aliasStrings = (inst.alias || []).map((a: any) => (typeof a === 'string' ? a : a.nombre));
    this.proyectosItems = (inst.proyectosAsociados || []).map((p: any) => {
      const proy = p.proyecto || p;
      if (typeof proy === 'object') return { _id: proy._id, nombre: proy.nombre };
      return { _id: proy, nombre: '(cargando...)' };
    });
    this.anotacionesItems = (inst.anotacionCartograficoTemporal || []).map((a: any) => ({
      ...a,
      fechaInicio: a.fechaInicio ? toDisplayFecha(a.fechaInicio) : undefined,
      fechaFin: a.fechaFin ? toDisplayFecha(a.fechaFin) : undefined,
    }));
    this.descriptorItems = inst.descriptorLibre || [];
    this.vinculoItems = inst.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (inst.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.instrumentoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected async onNombreBlur() {
    const nombre = this.instrumentoForm.get('nombre')?.value;
    if (!nombre || this.instrumentoForm.get('clasificacion')?.value) return;
    await this.hsService.load();
    const match = this.hsService.findUniversal(nombre);
    if (match) {
      this.instrumentoForm.patchValue({ clasificacion: match.code });
      const node = this.hsService.getNode(match.code);
      if (node) this.hsName.set(node.name);
    }
  }

  protected async openHsWizard() {
    await this.hsService.load();
    const ref = this.dialog.open(HsWizardComponent, {
      width: '740px',
      maxWidth: '95vw',
      data: { initialCode: this.instrumentoForm.get('clasificacion')?.value || undefined },
    });
    ref.afterClosed().subscribe((result: string | null) => {
      if (result) {
        this.instrumentoForm.patchValue({ clasificacion: result });
        const baseCode = result.split('-')[0];
        const node = this.hsService.getNode(baseCode);
        this.hsName.set(node?.name || null);
      }
    });
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
    if (this.instrumentoForm.invalid) return;

    const payload: any = {
      nombre: this.instrumentoForm.value.nombre,
      clasificacion: this.instrumentoForm.value.clasificacion || undefined,
      alias: this.aliasStrings.map((s) => ({ nombre: s })),
      proyectosAsociados: this.proyectosItems.map((p) => ({ proyecto: p._id })),
      anotacionCartograficoTemporal: this.anotacionesItems,
      descriptorLibre: this.descriptorItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.instrumentoId) {
      this.instrumentosService.update(this.instrumentoId, payload).subscribe({
        next: () => this.router.navigate(['/instrumentos', this.instrumentoId]),
        error: (err) => {
          console.error('[InstrumentoForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el instrumento');
        },
      });
    } else {
      this.instrumentosService.create(payload).subscribe({
        next: () => this.router.navigate(['/instrumentos']),
        error: (err) => {
          console.error('[InstrumentoForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el instrumento');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/instrumentos']);
  }
}
