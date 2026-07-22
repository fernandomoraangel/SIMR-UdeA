import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { SistemasStore } from '../../../state/sistemas.store';
import { SistemasService } from '../../../data/sistemas.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ListEditorComponent } from '../../../../../shared/list-editor/list-editor.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { AnotacionCartograficoTemporal, toDisplayFecha } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import {
  VinculoRelacionadoEditorComponent, VinculoRelacionado
} from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import {
  DescriptorLibreEditorComponent, DescriptorLibre
} from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import { CreateSistemaRequest, UpdateSistemaRequest, SistemaRelacion } from '../../../domain/sistema.model';

@Component({
  selector: 'app-sistema-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
    ListEditorComponent,
    AutocompleteCreateComponent,
    AnotacionesCartograficasComponent,
    VinculoRelacionadoEditorComponent,
    DescriptorLibreEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [SistemasStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Sistema Sonoro' : 'Nuevo Sistema Sonoro' }}</h1>
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

      <mat-card class="sistema-form" appearance="outlined">
        <form [formGroup]="sistemaForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre del sistema sonoro *</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Sistema de clasificación" />
              @if (isFieldInvalid('nombre')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción del sistema..."></textarea>
            </mat-form-field>
          </div>

          <app-collapsible-section title="Nombres alternativos (alias)" icon="alternate_email" [collapsed]="true">
            <div class="section-content">
              <app-list-editor
                [value]="aliasStrings"
                placeholder="Ej: Sistema alternativo"
                (valueChange)="aliasStrings = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Sistemas relacionados" icon="shuffle" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Sistema relacionado</mat-label>
                  <mat-select [formControl]="sistemaRelacionadoControl">
                    @for (s of allSistemas(); track s._id) {
                      @if (s._id !== documentId()) {
                        <mat-option [value]="s._id">{{ s.nombre }}</mat-option>
                      }
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Centro</mat-label>
                  <input matInput [formControl]="centroRelacionadoControl" placeholder="Ej: Centro de documentación" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addSistemaRelacionado()" [disabled]="!sistemaRelacionadoControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (sistemasRelacionadosItems.length > 0) {
                <div class="items-list">
                  @for (rel of sistemasRelacionadosItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ getSistemaNombre(rel.id) }}</span>
                      <span class="rel-detalle">{{ rel.centro }}</span>
                      <button mat-icon-button (click)="removeSistemaRelacionado($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay sistemas relacionados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Sistemas padres" icon="arrow_upward" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Sistema padre</mat-label>
                  <mat-select [formControl]="padreControl">
                    @for (s of allSistemas(); track s._id) {
                      @if (s._id !== documentId()) {
                        <mat-option [value]="s._id">{{ s.nombre }}</mat-option>
                      }
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Centro</mat-label>
                  <input matInput [formControl]="centroPadreControl" placeholder="Ej: Centro de documentación" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addPadre()" [disabled]="!padreControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (padresItems.length > 0) {
                <div class="items-list">
                  @for (p of padresItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ getSistemaNombre(p.id) }}</span>
                      <span class="rel-detalle">{{ p.centro }}</span>
                      <button mat-icon-button (click)="removePadre($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay sistemas padres.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Sistemas hijos" icon="arrow_downward" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Sistema hijo</mat-label>
                  <mat-select [formControl]="hijoControl">
                    @for (s of allSistemas(); track s._id) {
                      @if (s._id !== documentId()) {
                        <mat-option [value]="s._id">{{ s.nombre }}</mat-option>
                      }
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Centro</mat-label>
                  <input matInput [formControl]="centroHijoControl" placeholder="Ej: Centro de documentación" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addHijo()" [disabled]="!hijoControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (hijosItems.length > 0) {
                <div class="items-list">
                  @for (h of hijosItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ getSistemaNombre(h.id) }}</span>
                      <span class="rel-detalle">{{ h.centro }}</span>
                      <button mat-icon-button (click)="removeHijo($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay sistemas hijos.</p>
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
                  collection="sistemas"
                  (fileUploaded)="onFileUploaded($event)"
                  (fileDeleted)="onFileDeleted($event)"
                />
              </div>
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="sistemaForm.invalid || store.isLoading()">
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
    .sistema-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; }
    .inline-editor { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.5rem; margin-bottom: 0.75rem; }
    .campo-largo { flex: 1; min-width: 200px; }
    .campo-medio { width: 220px; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .rel-item {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline);
      border-radius: 8px; padding: 0.5rem 0.75rem; transition: border-color 0.2s;
    }
    .rel-item:hover { border-color: var(--simr-cobre); }
    .rel-nombre { font-weight: 600; font-size: 0.9rem; color: var(--simr-tinta); min-width: 160px; }
    .rel-detalle { flex: 1; font-size: 0.85rem; color: var(--simr-tinta-2); }
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
      .campo-largo, .campo-medio { width: 100%; }
    }
  `],
})
export class SistemaFormComponent implements OnInit {
  protected readonly store = inject(SistemasStore);
  private readonly sistemasService = inject(SistemasService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected sistemaId: string | null = null;

  protected aliasStrings: string[] = [];
  protected sistemasRelacionadosItems: SistemaRelacion[] = [];
  protected padresItems: SistemaRelacion[] = [];
  protected hijosItems: SistemaRelacion[] = [];
  protected proyectosItems: any[] = [];
  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected allSistemas = signal<any[]>([]);
  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected documentId = signal<string>('');

  protected sistemaRelacionadoControl = this.fb.control<string | null>(null);
  protected centroRelacionadoControl = this.fb.control<string>('');
  protected padreControl = this.fb.control<string | null>(null);
  protected centroPadreControl = this.fb.control<string>('');
  protected hijoControl = this.fb.control<string | null>(null);
  protected centroHijoControl = this.fb.control<string>('');

  sistemaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  constructor() {
    effect(() => {
      const sistema = this.store.selectedSistema();
      if (sistema && this.isEditMode) {
        this.loadSistemaData(sistema);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.sistemaId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/sistemas/${id}`).subscribe({
          next: (sistema: any) => {
            this.loadSistemaData(sistema);
          },
          error: (err) => console.error('[SistemaForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/sistemas`).subscribe({
      next: (data: any) => this.allSistemas.set(Array.isArray(data) ? data : data?.data || []),
      error: () => this.allSistemas.set([]),
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

  private loadSistemaData(sistema: any) {
    this.sistemaForm.patchValue({ nombre: sistema.nombre || '', descripcion: sistema.descripcion || '' });
    this.aliasStrings = (sistema.alias || []).map((a: any) => (typeof a === 'string' ? a : a.nombre));
    this.sistemasRelacionadosItems = sistema.sistemasRelacionados || [];
    this.padresItems = sistema.padres || [];
    this.hijosItems = sistema.hijos || [];
    this.proyectosItems = (sistema.proyectosAsociados || []).map((p: any) => {
      const proy = p.proyecto || p;
      if (typeof proy === 'object') return { _id: proy._id, nombre: proy.nombre };
      return { _id: proy, nombre: '(cargando...)' };
    });
    this.anotacionesItems = (sistema.anotacionCartograficoTemporal || []).map((a: any) => ({
      ...a,
      fechaInicio: a.fechaInicio ? toDisplayFecha(a.fechaInicio) : undefined,
      fechaFin: a.fechaFin ? toDisplayFecha(a.fechaFin) : undefined,
    }));
    this.descriptorItems = sistema.descriptorLibre || [];
    this.vinculoItems = sistema.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (sistema.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.sistemaForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected addSistemaRelacionado() {
    const id = this.sistemaRelacionadoControl.value;
    const centro = this.centroRelacionadoControl.value || '';
    if (!id) return;
    this.sistemasRelacionadosItems = [...this.sistemasRelacionadosItems, { id, centro }];
    this.sistemaRelacionadoControl.reset();
    this.centroRelacionadoControl.reset();
  }

  protected removeSistemaRelacionado(index: number) {
    this.sistemasRelacionadosItems = this.sistemasRelacionadosItems.filter((_, i) => i !== index);
  }

  protected addPadre() {
    const id = this.padreControl.value;
    const centro = this.centroPadreControl.value || '';
    if (!id) return;
    this.padresItems = [...this.padresItems, { id, centro }];
    this.padreControl.reset();
    this.centroPadreControl.reset();
  }

  protected removePadre(index: number) {
    this.padresItems = this.padresItems.filter((_, i) => i !== index);
  }

  protected addHijo() {
    const id = this.hijoControl.value;
    const centro = this.centroHijoControl.value || '';
    if (!id) return;
    this.hijosItems = [...this.hijosItems, { id, centro }];
    this.hijoControl.reset();
    this.centroHijoControl.reset();
  }

  protected removeHijo(index: number) {
    this.hijosItems = this.hijosItems.filter((_, i) => i !== index);
  }

  protected getSistemaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.allSistemas().find((s) => s._id === ref);
    return found?.nombre || '(cargando…)';
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
    if (this.sistemaForm.invalid) return;

    const payload: any = {
      nombre: this.sistemaForm.value.nombre,
      descripcion: this.sistemaForm.value.descripcion || '',
      alias: this.aliasStrings.map((s) => ({ nombre: s })),
      sistemasRelacionados: this.sistemasRelacionadosItems,
      padres: this.padresItems,
      hijos: this.hijosItems,
      proyectosAsociados: this.proyectosItems.map((p) => ({ proyecto: p._id })),
      anotacionCartograficoTemporal: this.anotacionesItems,
      descriptorLibre: this.descriptorItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.sistemaId) {
      this.sistemasService.update(this.sistemaId, payload).subscribe({
        next: () => this.router.navigate(['/sistemas', this.sistemaId]),
        error: (err) => {
          console.error('[SistemaForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el sistema');
        },
      });
    } else {
      this.sistemasService.create(payload).subscribe({
        next: () => this.router.navigate(['/sistemas']),
        error: (err) => {
          console.error('[SistemaForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el sistema');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/sistemas']);
  }
}
