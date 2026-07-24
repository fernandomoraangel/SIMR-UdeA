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
import { RecursosStore } from '../../../state/recursos.store';
import { RecursosService } from '../../../data/recursos.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { formatActorName } from '../../../../actores/models/actor.interface';
import { AnotacionCartograficoTemporal, toDisplayFecha, precisionFecha, formatDate } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import {
  VinculoRelacionadoEditorComponent, VinculoRelacionado
} from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import {
  DescriptorLibreEditorComponent, DescriptorLibre
} from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import {
  ObraRelacionada, NumeroNormalizado, MencionResponsabilidad,
  ContenedorAsociado,   FuenteAsociada, TipoDeRecurso,
  MateriaAsociada, IdiomaAsociado, DescripcionTecnica, ProyectoAsociado
} from '../../../domain/recurso.interface';

@Component({
  selector: 'app-recurso-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
    AutocompleteCreateComponent,
    AnotacionesCartograficasComponent,
    VinculoRelacionadoEditorComponent,
    DescriptorLibreEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [RecursosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Recurso' : 'Nuevo Recurso' }}</h1>
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

      <mat-card class="recurso-form" appearance="outlined">
        <form [formGroup]="recursoForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Título *</mat-label>
              <input matInput formControlName="titulo" placeholder="Ej: Partitura de la Sinfonía No. 5" />
              @if (isFieldInvalid('titulo')) {
                <mat-error>El título es obligatorio</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción del recurso..."></textarea>
            </mat-form-field>

            <p class="subtitulo">Obras relacionadas</p>
            <app-autocomplete-create
              apiEndpoint="obras"
              placeholder="Buscar obra..."
              displayField="titulo"
              [selected]="obrasRelacionadasItems"
              (selectedChange)="onObrasChange($event)"
            />

            <p class="subtitulo">Números normalizados</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Nombre</mat-label>
                <mat-select [formControl]="numNormalizadoNombreControl">
                  @for (n of listaNumeroNormalizado(); track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                <mat-label>Número</mat-label>
                <input matInput [formControl]="numNormalizadoNumeroControl" placeholder="Ej: 978-84-1234-567-8" />
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addNumeroNormalizado()"
                [disabled]="!numNormalizadoNombreControl.value || !numNormalizadoNumeroControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (numeroNormalizadoItems.length > 0) {
              <div class="items-list">
                @for (item of numeroNormalizadoItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ item.nombre }}</span>
                    <span class="rel-detalle">{{ item.numero }}</span>
                    <button mat-icon-button (click)="removeNumeroNormalizado($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay números normalizados.</p>
            }

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Faceta</mat-label>
              <input matInput formControlName="faceta" placeholder="Ej: faceta del recurso..." />
            </mat-form-field>

            <p class="subtitulo">Menciones de responsabilidad</p>
            <div class="inline-editor">
              <app-autocomplete-create
                apiEndpoint="actores"
                placeholder="Buscar actor..."
                displayField="fullName"
                [selected]="mencionActorSelection"
                (selectedChange)="onMencionActorChange($event)"
                class="campo-largo"
              />
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Tipo de mención</mat-label>
                <mat-select [formControl]="mencionTipoControl">
                  @for (r of listaRoles(); track r) {
                    <mat-option [value]="r">{{ r }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addMencion()"
                [disabled]="!mencionActorSelection.length || !mencionTipoControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (mencionItems.length > 0) {
              <div class="items-list">
                @for (m of mencionItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ getActorNombre(m.actor) }}</span>
                    <span class="rel-detalle">{{ m.tipoDeMencion }}</span>
                    <button mat-icon-button (click)="removeMencion($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay menciones de responsabilidad.</p>
            }

            <p class="subtitulo">Contenedores (recursos)</p>
            <app-autocomplete-create
              apiEndpoint="recursos"
              placeholder="Buscar recurso contenedor..."
              displayField="titulo"
              [selected]="contenedoresItems"
              (selectedChange)="onContenedoresChange($event)"
            />

            <p class="subtitulo">Fuente</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Tipo de fuente</mat-label>
                <mat-select [formControl]="fuenteTipoControl">
                  @for (t of listaTipoFuente(); track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Lugar</mat-label>
                <input matInput [formControl]="fuenteLugarControl" placeholder="Ej: Bogotá" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                <mat-label>Nombre</mat-label>
                <input matInput [formControl]="fuenteNombreControl" placeholder="Ej: Editorial XYZ" />
              </mat-form-field>
            </div>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Fecha (AAAA/MM/DD)</mat-label>
                <input matInput [formControl]="fuenteFechaControl" placeholder="Ej: 1990/0/0 — Use 0 si no se conoce" />
                <mat-hint>Escriba 0 en mes o día si no se conoce</mat-hint>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addFuente()"
                [disabled]="!fuenteTipoControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (fuenteItems.length > 0) {
              <div class="items-list">
                @for (f of fuenteItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ f.tipoFuente }}</span>
                    <span class="rel-detalle">{{ displayFuente(f) }}</span>
                    <button mat-icon-button (click)="removeFuente($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay fuentes registradas.</p>
            }

            <p class="subtitulo">Tipos de recurso</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Tipo</mat-label>
                <mat-select [formControl]="tipoRecursoControl">
                  @for (t of listaTiposDeRecurso(); track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addTipoRecurso()"
                [disabled]="!tipoRecursoControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (tiposDeRecursoItems.length > 0) {
              <div class="items-list">
                @for (t of tiposDeRecursoItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ t.id }}</span>
                    <button mat-icon-button (click)="removeTipoRecurso($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay tipos de recurso.</p>
            }

            <p class="subtitulo">Materias</p>
            <app-autocomplete-create
              apiEndpoint="materias"
              placeholder="Buscar materia..."
              [selected]="materiaItems"
              (selectedChange)="onMateriaChange($event)"
            />

            <p class="subtitulo">Idiomas</p>
            <app-autocomplete-create
              apiEndpoint="idiomas"
              placeholder="Buscar idioma..."
              displayField="idioma"
              [selected]="idiomaItems"
              (selectedChange)="onIdiomasChange($event)"
            />

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Material acompañante</mat-label>
              <input matInput formControlName="materialAcompanante" placeholder="Ej: CD-ROM adjunto" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Mención de serie</mat-label>
              <input matInput formControlName="mencionDeSerie" placeholder="Ej: Colección Músicas Regionales No. 5" />
            </mat-form-field>

            <p class="subtitulo">Proyectos asociados</p>
            <app-autocomplete-create
              apiEndpoint="proyectos"
              placeholder="Buscar proyecto..."
              [selected]="proyectosItems"
              (selectedChange)="onProyectosChange($event)"
            />
          </div>

          <app-collapsible-section title="Descripción técnica" icon="settings" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Criterio</mat-label>
                  <mat-select [formControl]="descTecnicaCriterioControl">
                    @for (c of listaCriterio(); track c) {
                      <mat-option [value]="c">{{ c }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Valor</mat-label>
                  <input matInput [formControl]="descTecnicaValorControl" placeholder="Ej: 30 cm" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addDescripcionTecnica()"
                  [disabled]="!descTecnicaCriterioControl.value || !descTecnicaValorControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (descripcionTecnicaItems.length > 0) {
                <div class="items-list">
                  @for (d of descripcionTecnicaItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ d.criterio }}</span>
                      <span class="rel-detalle">{{ d.valor }}</span>
                      <button mat-icon-button (click)="removeDescripcionTecnica($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay descripciones técnicas.</p>
              }
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

          <app-collapsible-section title="Enlaces" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-vinculo-relacionado-editor
                [vinculos]="vinculoItems"
                (vinculosChange)="vinculoItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="documentId()"
                collection="recursos"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
              />
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="recursoForm.invalid || store.isLoading()">
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
    .recurso-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
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
    .subtitulo { margin: 0.5rem 0 0.25rem; font-size: 0.88rem; color: var(--simr-tinta); font-weight: 600; }
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
export class RecursoFormComponent implements OnInit {
  protected readonly store = inject(RecursosStore);
  private readonly recursosService = inject(RecursosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected recursoId: string | null = null;

  protected obrasRelacionadasItems: any[] = [];
  protected numeroNormalizadoItems: NumeroNormalizado[] = [];
  protected mencionItems: MencionResponsabilidad[] = [];
  protected mencionActorSelection: any[] = [];
  protected contenedoresItems: any[] = [];
  protected fuenteItems: FuenteAsociada[] = [];
  protected tipoRecursoControl = this.fb.control<string | null>(null);
  protected tiposDeRecursoItems: any[] = [];
  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];
  protected materiaItems: any[] = [];
  protected idiomaItems: any[] = [];
  protected descripcionTecnicaItems: DescripcionTecnica[] = [];
  protected proyectosItems: any[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected allRecursos = signal<any[]>([]);
  protected allActores = signal<any[]>([]);
  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected listaNumeroNormalizado = signal<string[]>([]);
  protected listaRoles = signal<string[]>([]);
  protected listaTipoFuente = signal<string[]>([]);
  protected listaTiposDeRecurso = signal<string[]>([]);
  protected listaCriterio = signal<string[]>([]);
  protected documentId = signal<string>('');

  protected numNormalizadoNombreControl = this.fb.control<string | null>(null);
  protected numNormalizadoNumeroControl = this.fb.control<string | null>(null);
  protected mencionTipoControl = this.fb.control<string | null>(null);
  protected fuenteTipoControl = this.fb.control<string | null>(null);
  protected fuenteLugarControl = this.fb.control<string | null>(null);
  protected fuenteNombreControl = this.fb.control<string | null>(null);
  protected fuenteFechaControl = this.fb.control<string | null>(null);
  protected descTecnicaCriterioControl = this.fb.control<string | null>(null);
  protected descTecnicaValorControl = this.fb.control<string | null>(null);

  recursoForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    faceta: [''],
    materialAcompanante: [''],
    mencionDeSerie: [''],
  });

  constructor() {
    effect(() => {
      const recurso = this.store.selectedRecurso();
      if (recurso && this.isEditMode) {
        this.loadRecursoData(recurso);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.recursoId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/recursos/${id}`).subscribe({
          next: (recurso: any) => {
            this.loadRecursoData(recurso);
          },
          error: (err) => console.error('[RecursoForm] error al cargar', err),
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
    this.http.get(`${apiUrl}/listas/nNormalizados`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaNumeroNormalizado.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaNumeroNormalizado.set([]),
    });
    this.http.get(`${apiUrl}/listas/roles`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaRoles.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaRoles.set([]),
    });
    this.http.get(`${apiUrl}/listas/tipoFuente`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaTipoFuente.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaTipoFuente.set([]),
    });
    this.http.get(`${apiUrl}/listas/tipos`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaTiposDeRecurso.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaTiposDeRecurso.set([]),
    });
    this.http.get(`${apiUrl}/listas/criterio`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaCriterio.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaCriterio.set([]),
    });
  }

  private loadRecursoData(recurso: any) {
    this.recursoForm.patchValue({
      titulo: recurso.titulo || '',
      descripcion: recurso.descripcion || '',
      faceta: recurso.faceta || '',
      materialAcompanante: recurso.materialAcompanante || '',
      mencionDeSerie: recurso.mencionDeSerie || '',
    });
    this.obrasRelacionadasItems = (recurso.obrasRelacionadas || []).map((o: any) => ({
      _id: o.id || o,
      titulo: '(cargando...)',
    }));
    this.numeroNormalizadoItems = recurso.numeroNormalizado || [];
    this.mencionItems = recurso.mencionResponsabilidad || [];
    this.mencionActorSelection = [];
    this.contenedoresItems = (recurso.contenedores || []).map((c: any) => {
      const id = c.id || c;
      if (typeof id === 'object') return { _id: id._id, titulo: id.titulo };
      return { _id: id, titulo: '(cargando...)' };
    });
    this.fuenteItems = (recurso.fuente || []).map((f: any) => ({
      tipoFuente: f.tipoFuente || '',
      lugar: f.lugar || '',
      nombre: f.nombre || '',
      fecha: f.fecha ? toDisplayFecha(f.fecha) : '',
      precision: f.precision || '',
    }));
    this.tiposDeRecursoItems = (recurso.tiposDeRecurso || []).map((t: any) => ({ id: t.id || t }));
    this.anotacionesItems = (recurso.anotacionCartograficoTemporal || []).map((a: any) => ({
      ...a,
      fechaInicio: a.fechaInicio ? toDisplayFecha(a.fechaInicio) : undefined,
      fechaFin: a.fechaFin ? toDisplayFecha(a.fechaFin) : undefined,
    }));
    this.materiaItems = (recurso.materia || []).map((m: any) => {
      const id = m.id || m;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.idiomaItems = (recurso.idiomas || []).map((i: any) => {
      const id = i.id || i;
      if (typeof id === 'object') return { _id: id._id, idioma: id.idioma || id.nombre };
      return { _id: id, idioma: '(cargando...)' };
    });
    this.descripcionTecnicaItems = recurso.descripcionTecnica || [];
    this.proyectosItems = (recurso.proyectos || []).map((p: any) => {
      const id = p.id || p;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.descriptorItems = recurso.descriptorLibre || [];
    this.vinculoItems = recurso.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (recurso.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.recursoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected addNumeroNormalizado() {
    const nombre = this.numNormalizadoNombreControl.value;
    const numero = this.numNormalizadoNumeroControl.value;
    if (!nombre || !numero) return;
    this.numeroNormalizadoItems = [...this.numeroNormalizadoItems, { nombre, numero }];
    this.numNormalizadoNombreControl.reset();
    this.numNormalizadoNumeroControl.reset();
  }

  protected removeNumeroNormalizado(index: number) {
    this.numeroNormalizadoItems = this.numeroNormalizadoItems.filter((_, i) => i !== index);
  }

  protected addMencion() {
    const actor = this.mencionActorSelection[0];
    const tipoDeMencion = this.mencionTipoControl.value;
    if (!actor || !tipoDeMencion) return;
    this.mencionItems = [...this.mencionItems, { actor: { _id: actor._id, nombre: actor.fullName || actor.nombre }, tipoDeMencion }];
    this.mencionActorSelection = [];
    this.mencionTipoControl.reset();
  }

  protected removeMencion(index: number) {
    this.mencionItems = this.mencionItems.filter((_, i) => i !== index);
  }

  protected getActorNombre(actor: any): string {
    if (!actor) return '';
    if (typeof actor === 'object' && (actor.nombres || actor.apellidos || actor.nombreArtistico || actor.nombreReunion)) {
      return formatActorName(actor);
    }
    if (typeof actor === 'object' && actor.nombre) return actor.nombre;
    if (typeof actor === 'object' && actor._id) {
      return '(seleccionado)';
    }
    return typeof actor === 'string' ? actor : '';
  }

  protected addFuente() {
    const tipoFuente = this.fuenteTipoControl.value;
    if (!tipoFuente) return;
    const rawFecha = this.fuenteFechaControl.value || '';
    let fecha = '';
    let precision = '';
    if (rawFecha) {
      const n = precisionFecha(rawFecha);
      const parts = n.fecha.split('/');
      const y = parseInt(parts[0], 10) || 2000;
      const m = parseInt(parts[1], 10) || 1;
      const d = parseInt(parts[2], 10) || 1;
      fecha = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      precision = n.precision;
    }
    this.fuenteItems = [...this.fuenteItems, {
      tipoFuente,
      lugar: this.fuenteLugarControl.value || '',
      nombre: this.fuenteNombreControl.value || '',
      fecha,
      precision,
    }];
    this.fuenteTipoControl.reset();
    this.fuenteLugarControl.reset();
    this.fuenteNombreControl.reset();
    this.fuenteFechaControl.reset();
  }

  protected removeFuente(index: number) {
    this.fuenteItems = this.fuenteItems.filter((_, i) => i !== index);
  }

  protected addTipoRecurso() {
    const val = this.tipoRecursoControl.value;
    if (!val) return;
    if (!this.tiposDeRecursoItems.find((t) => t.id === val)) {
      this.tiposDeRecursoItems = [...this.tiposDeRecursoItems, { id: val }];
    }
    this.tipoRecursoControl.reset();
  }

  protected removeTipoRecurso(index: number) {
    this.tiposDeRecursoItems = this.tiposDeRecursoItems.filter((_, i) => i !== index);
  }

  protected displayFuente(f: FuenteAsociada): string {
    const parts: string[] = [];
    if (f.nombre) parts.push(f.nombre);
    if (f.lugar) parts.push(f.lugar);
    if (f.fecha) {
      const d = toDisplayFecha(f.fecha as string);
      const [y, m, day] = d.split('/');
      parts.push(formatDate(y, m, day, f.precision));
    }
    return parts.join(' — ');
  }

  protected addDescripcionTecnica() {
    const criterio = this.descTecnicaCriterioControl.value;
    const valor = this.descTecnicaValorControl.value;
    if (!criterio || !valor) return;
    this.descripcionTecnicaItems = [...this.descripcionTecnicaItems, { criterio, valor }];
    this.descTecnicaCriterioControl.reset();
    this.descTecnicaValorControl.reset();
  }

  protected removeDescripcionTecnica(index: number) {
    this.descripcionTecnicaItems = this.descripcionTecnicaItems.filter((_, i) => i !== index);
  }

  protected onObrasChange(items: any[]) {
    this.obrasRelacionadasItems = items;
  }

  protected onMencionActorChange(items: any[]) {
    this.mencionActorSelection = items;
  }

  protected onContenedoresChange(items: any[]) {
    this.contenedoresItems = items;
  }

  protected onMateriaChange(items: any[]) {
    this.materiaItems = items;
  }

  protected onIdiomasChange(items: any[]) {
    this.idiomaItems = items;
  }

  protected onProyectosChange(items: any[]) {
    this.proyectosItems = items;
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
    if (this.recursoForm.invalid) return;

    const payload: any = {
      titulo: this.recursoForm.value.titulo,
      descripcion: this.recursoForm.value.descripcion || '',
      faceta: this.recursoForm.value.faceta || '',
      materialAcompanante: this.recursoForm.value.materialAcompanante || '',
      mencionDeSerie: this.recursoForm.value.mencionDeSerie || '',
      obrasRelacionadas: this.obrasRelacionadasItems.map((o) => ({ id: o._id })),
      numeroNormalizado: this.numeroNormalizadoItems,
      mencionResponsabilidad: this.mencionItems,
      contenedores: this.contenedoresItems.map((c) => ({ id: c._id })),
      fuente: this.fuenteItems,
      tiposDeRecurso: this.tiposDeRecursoItems,
      anotacionCartograficoTemporal: this.anotacionesItems,
      materia: this.materiaItems.map((m) => ({ id: m._id })),
      idiomas: this.idiomaItems.map((i) => ({ id: i._id })),
      descripcionTecnica: this.descripcionTecnicaItems,
      proyectos: this.proyectosItems.map((p) => ({ id: p._id })),
      vinculoRelacionado: this.vinculoItems,
      descriptorLibre: this.descriptorItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.recursoId) {
      this.recursosService.update(this.recursoId, payload).subscribe({
        next: () => this.router.navigate(['/recursos', this.recursoId]),
        error: (err) => {
          console.error('[RecursoForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el recurso');
        },
      });
    } else {
      this.recursosService.create(payload).subscribe({
        next: () => this.router.navigate(['/recursos']),
        error: (err) => {
          console.error('[RecursoForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el recurso');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/recursos']);
  }
}
