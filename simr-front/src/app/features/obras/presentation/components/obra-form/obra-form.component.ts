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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ObrasStore } from '../../../data/obras.store';
import { ObrasService } from '../../../data/obras.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { AnotacionCartograficoTemporal, toDisplayFecha, precisionFecha } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import {
  DenominacionRegional, ContenedorAsociado, AsientoLigado, ActorAsociado,
  MateriaAsociada, MedioAsociado, SistemaAsociado, IdiomaAsociado,
  GeneroFormaAsociado, ProyectoAsociado, VinculoRelacionado, DescriptorLibre, ArchivoAdjunto
} from '../../../models/obra.interface';
import { formatActorName } from '../../../../actores/models/actor.interface';

@Component({
  selector: 'app-obra-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
    AutocompleteCreateComponent,
    AnotacionesCartograficasComponent,
    ArchivoManagerComponent,
  ],
  providers: [ObrasStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Obra' : 'Nueva Obra' }}</h1>
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

      <mat-card class="obra-form" appearance="outlined">
        <form [formGroup]="obraForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Título uniforme *</mat-label>
              <input matInput formControlName="titulo" placeholder="Ej: Sinfonía No. 5" />
              @if (isFieldInvalid('titulo')) {
                <mat-error>El título es obligatorio</mat-error>
              }
            </mat-form-field>

            <p class="subtitulo">Denominación(es) regional-socio-cultural(es)</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Denominación</mat-label>
                <input matInput [formControl]="denominacionControl" placeholder="Ej: Bambuco" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                <mat-label>Fuente de la denominación</mat-label>
                <input matInput [formControl]="fuenteDenominacionControl" placeholder="Ej: Diccionario de la Música Tradicional Colombiana" />
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addDenominacion()"
                [disabled]="!denominacionControl.value || !fuenteDenominacionControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (denominacionItems.length > 0) {
              <div class="items-list">
                @for (d of denominacionItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ d.denominacionRegional }}</span>
                    <span class="rel-detalle">{{ d.fuenteDenominacion }}</span>
                    <button mat-icon-button (click)="removeDenominacion($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay denominaciones registradas.</p>
            }

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción de la obra..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                @for (t of listaTipos(); track t) {
                  <mat-option [value]="t">{{ t }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-section">
            <p class="subtitulo">Contenedores (obras)</p>
            <app-autocomplete-create
              apiEndpoint="obras"
              placeholder="Buscar obra contenedora..."
              displayField="titulo"
              [selected]="contenedoresItems"
              (selectedChange)="onContenedoresChange($event)"
            />

            <p class="subtitulo">Actores</p>
            <div class="inline-editor">
              <app-autocomplete-create
                apiEndpoint="actores"
                placeholder="Buscar actor..."
                displayField="fullName"
                [selected]="actorSelection"
                (selectedChange)="onActorChange($event)"
                class="campo-largo"
              />
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Rol</mat-label>
                <mat-select [formControl]="actorRolControl">
                  @for (r of listaRoles(); track r) {
                    <mat-option [value]="r">{{ r }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addActor()"
                [disabled]="!actorSelection.length || !actorRolControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (actorItems.length > 0) {
              <div class="items-list">
                @for (a of actorItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ getActorNombre(a.id) }}</span>
                    <span class="rel-detalle">{{ a.rol }}</span>
                    <button mat-icon-button (click)="removeActor($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay actores asociados.</p>
            }

            <p class="subtitulo">Géneros-formas-especies (musicales)</p>
            <app-autocomplete-create
              apiEndpoint="generos"
              placeholder="Buscar género musical..."
              displayField="nombre"
              [selected]="generosFormasItems"
              (selectedChange)="onGenerosFormasChange($event)"
            />

            <p class="subtitulo">Géneros-formas no musicales</p>
            <app-autocomplete-create
              apiEndpoint="generosnomusicales"
              placeholder="Buscar género no musical..."
              displayField="nombre"
              [selected]="generosNoMusicalesItems"
              (selectedChange)="onGenerosNoMusicalesChange($event)"
            />

            <p class="subtitulo">Materias</p>
            <app-autocomplete-create
              apiEndpoint="materias"
              placeholder="Buscar materia..."
              displayField="nombre"
              [selected]="materiaItems"
              (selectedChange)="onMateriasChange($event)"
            />

            <p class="subtitulo">Medios sonoros-formatos asociados</p>
            <app-autocomplete-create
              apiEndpoint="medios"
              placeholder="Buscar medio sonoro..."
              displayField="nombre"
              [selected]="medioItems"
              (selectedChange)="onMediosChange($event)"
            />

            <p class="subtitulo">Sistemas sonoros asociados</p>
            <div class="inline-editor">
              <app-autocomplete-create
                apiEndpoint="sistemas"
                placeholder="Buscar sistema sonoro..."
                displayField="nombre"
                [selected]="sistemaSelection"
                (selectedChange)="onSistemaChange($event)"
                class="campo-largo"
              />
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Centro (tonalidad)</mat-label>
                <mat-select [formControl]="sistemaCentroControl">
                  @for (c of listaCentros(); track c) {
                    <mat-option [value]="c">{{ c }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addSistema()"
                [disabled]="!sistemaSelection.length">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (sistemaItems.length > 0) {
              <div class="items-list">
                @for (s of sistemaItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ getSistemaNombre(s.id) }}</span>
                    <span class="rel-detalle">{{ s.centro ? 'Centro: ' + s.centro : '' }}</span>
                    <button mat-icon-button (click)="removeSistema($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay sistemas sonoros asociados.</p>
            }

            <p class="subtitulo">Idiomas</p>
            <app-autocomplete-create
              apiEndpoint="idiomas"
              placeholder="Buscar idioma..."
              displayField="idioma"
              [selected]="idiomaItems"
              (selectedChange)="onIdiomasChange($event)"
            />
          </div>

          <app-collapsible-section title="Asientos ligados" icon="link" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <app-autocomplete-create
                  apiEndpoint="obras"
                  placeholder="Buscar obra..."
                  displayField="titulo"
                  [selected]="asientoObraSelection"
                  (selectedChange)="onAsientoObraChange($event)"
                  class="campo-largo"
                />
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Tipo de relación</mat-label>
                  <mat-select [formControl]="asientoTipoControl">
                    @for (t of listaTiposDeRelacion(); track t) {
                      <mat-option [value]="t">{{ t }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Dirección de la relación</mat-label>
                  <mat-select [formControl]="asientoDireccionControl">
                    @for (d of listaDirecciones(); track d) {
                      <mat-option [value]="d">{{ d }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Fuente de la relación</mat-label>
                  <input matInput [formControl]="asientoFuenteControl" placeholder="Fuente" />
                </mat-form-field>
              </div>
              <div class="inline-editor">
                <app-autocomplete-create
                  apiEndpoint="proyectos"
                  placeholder="Buscar proyecto asociado..."
                  displayField="nombre"
                  [selected]="asientoProyectoSelection"
                  (selectedChange)="onAsientoProyectoChange($event)"
                  class="campo-largo"
                />
              </div>
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Nota general</mat-label>
                <textarea matInput [formControl]="asientoNotaControl" rows="2" placeholder="Nota general"></textarea>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addAsientoLigado()"
                [disabled]="!asientoObraSelection.length">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
              @if (asientoItems.length > 0) {
                <div class="items-list">
                  @for (a of asientoItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ getObraNombre(a.id) }}</span>
                      <span class="rel-detalle">{{ a.tipoDeRelacion }} — {{ a.direccionDeRelacion }}</span>
                      <button mat-icon-button (click)="removeAsiento($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay asientos ligados.</p>
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
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Etiqueta</mat-label>
                  <mat-select [formControl]="descEtiquetaControl">
                    @for (e of listaEtiquetas(); track e) {
                      <mat-option [value]="e">{{ e }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Contenido</mat-label>
                  <input matInput [formControl]="descContenidoControl" placeholder="Contenido del descriptor" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addDescriptor()"
                  [disabled]="!descEtiquetaControl.value || !descContenidoControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (descriptorItems.length > 0) {
                <div class="items-list">
                  @for (d of descriptorItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ d.etiqueta }}</span>
                      <span class="rel-detalle">{{ d.contenido }}</span>
                      <button mat-icon-button (click)="removeDescriptor($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay descriptores libres.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Enlaces y archivos" icon="link" [collapsed]="true">
            <div class="section-content">
              <h3>Enlaces</h3>
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Nombre (descripción)</mat-label>
                  <input matInput [formControl]="vinculoEtiquetaControl" placeholder="Nombre del enlace" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>URL</mat-label>
                  <input matInput [formControl]="vinculoUrlControl" placeholder="https://..." />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addVinculo()"
                  [disabled]="!vinculoUrlControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (vinculoItems.length > 0) {
                <div class="items-list">
                  @for (v of vinculoItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ v.etiqueta || 'Enlace' }}</span>
                      <span class="rel-detalle">{{ v.url }}</span>
                      <button mat-icon-button (click)="removeVinculo($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay enlaces registrados.</p>
              }

              <hr />
              <h3>Archivos</h3>
              <app-archivo-manager
                [documentId]="documentId()"
                collection="obras"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Proyectos asociados" icon="folder" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="proyectos"
                placeholder="Buscar proyecto..."
                displayField="nombre"
                [selected]="proyectosItems"
                (selectedChange)="onProyectosChange($event)"
              />
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="obraForm.invalid || store.isLoading()">
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
    .obra-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; }
    .section-content h3 { margin: 0.75rem 0 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--simr-tinta); }
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
    hr { border: none; border-top: 1px solid var(--mat-sys-outline); margin: 0.75rem 0; }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
      .inline-editor { flex-direction: column; align-items: stretch; }
      .campo-largo, .campo-medio { width: 100%; }
    }
  `],
})
export class ObraFormComponent implements OnInit {
  protected readonly store = inject(ObrasStore);
  private readonly obrasService = inject(ObrasService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected obraId: string | null = null;

  protected denominacionItems: DenominacionRegional[] = [];
  protected contenedoresItems: any[] = [];
  protected actorItems: ActorAsociado[] = [];
  protected actorSelection: any[] = [];
  protected generosFormasItems: any[] = [];
  protected generosNoMusicalesItems: any[] = [];
  protected materiaItems: any[] = [];
  protected medioItems: any[] = [];
  protected sistemaItems: SistemaAsociado[] = [];
  protected sistemaSelection: any[] = [];
  protected idiomaItems: any[] = [];
  protected proyectosItems: any[] = [];

  protected asientoItems: AsientoLigado[] = [];
  protected asientoObraSelection: any[] = [];
  protected asientoProyectoSelection: any[] = [];

  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];

  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  protected listaTipos = signal<string[]>([]);
  protected listaRoles = signal<string[]>([]);
  protected listaCentros = signal<string[]>([]);
  protected listaTiposDeRelacion = signal<string[]>([]);
  protected listaDirecciones = signal<string[]>([]);
  protected listaEtiquetas = signal<string[]>([]);
  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected documentId = signal<string>('');

  protected denominacionControl = this.fb.control<string | null>(null);
  protected fuenteDenominacionControl = this.fb.control<string | null>(null);
  protected actorRolControl = this.fb.control<string | null>(null);
  protected sistemaCentroControl = this.fb.control<string | null>(null);
  protected asientoTipoControl = this.fb.control<string | null>(null);
  protected asientoDireccionControl = this.fb.control<string | null>(null);
  protected asientoFuenteControl = this.fb.control<string | null>(null);
  protected asientoNotaControl = this.fb.control<string | null>(null);
  protected descEtiquetaControl = this.fb.control<string | null>(null);
  protected descContenidoControl = this.fb.control<string | null>(null);
  protected vinculoEtiquetaControl = this.fb.control<string | null>(null);
  protected vinculoUrlControl = this.fb.control<string | null>(null);

  protected allActores = signal<any[]>([]);
  protected allObras = signal<any[]>([]);
  protected allSistemas = signal<any[]>([]);

  obraForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    tipo: [''],
  });

  constructor() {
    effect(() => {
      const obra = this.store.selectedObra();
      if (obra && this.isEditMode) {
        this.loadObraData(obra);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.obraId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/obras/${id}`).subscribe({
          next: (obra: any) => this.loadObraData(obra),
          error: (err) => console.error('[ObraForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/listas/tipos`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaTipos.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaTipos.set([]),
    });
    this.http.get(`${apiUrl}/listas/roles`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaRoles.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaRoles.set([]),
    });
    this.http.get(`${apiUrl}/listas/centros`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaCentros.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaCentros.set([]),
    });
    this.http.get(`${apiUrl}/listas/tiposDeRelacion`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaTiposDeRelacion.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaTiposDeRelacion.set([]),
    });
    this.http.get(`${apiUrl}/listas/direcciones`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaDirecciones.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaDirecciones.set([]),
    });
    this.http.get(`${apiUrl}/listas/dEtiquetas`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaEtiquetas.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaEtiquetas.set([]),
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
    this.http.get<any>(`${apiUrl}/actores`).subscribe({
      next: (res) => this.allActores.set(Array.isArray(res) ? res : res?.data || []),
      error: () => {},
    });
    this.http.get<any>(`${apiUrl}/obras`).subscribe({
      next: (res) => this.allObras.set(Array.isArray(res) ? res : res?.data || []),
      error: () => {},
    });
    this.http.get<any>(`${apiUrl}/sistemas`).subscribe({
      next: (res) => this.allSistemas.set(Array.isArray(res) ? res : res?.data || []),
      error: () => {},
    });
  }

  private loadObraData(obra: any) {
    this.obraForm.patchValue({
      titulo: obra.titulo || '',
      descripcion: obra.descripcion || '',
      tipo: obra.tipo || '',
    });
    this.denominacionItems = obra.denominacionRegional || [];
    this.contenedoresItems = (obra.contenedores || []).map((c: any) => {
      const id = c.id || c;
      if (typeof id === 'object') return { _id: id._id, titulo: id.titulo };
      return { _id: id, titulo: '(cargando...)' };
    });
    this.actorItems = (obra.actores || []).map((a: any) => ({
      id: a.id || a,
      rol: a.rol || '',
    }));
    this.generosFormasItems = (obra.generosFormas || []).map((g: any) => {
      const id = g.id || g;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.generosNoMusicalesItems = (obra.GenerosFormasNoMusicales || []).map((g: any) => {
      const id = g.id || g;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.materiaItems = (obra.materias || []).map((m: any) => {
      const id = m.id || m;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.medioItems = (obra.mediosSonoros || []).map((m: any) => {
      const id = m.id || m;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.sistemaItems = (obra.sistemasSonoros || []).map((s: any) => ({
      id: s.id || s,
      centro: s.centro || '',
    }));
    this.idiomaItems = (obra.idiomas || []).map((i: any) => {
      const id = i.id || i;
      if (typeof id === 'object') return { _id: id._id, idioma: id.idioma || id.nombre };
      return { _id: id, idioma: '(cargando...)' };
    });
    this.asientoItems = obra.asientoLigado || [];
    this.anotacionesItems = (obra.anotacionCartograficoTemporal || []).map((a: any) => ({
      ...a,
      fechaInicio: a.fechaInicio ? toDisplayFecha(a.fechaInicio) : undefined,
      fechaFin: a.fechaFin ? toDisplayFecha(a.fechaFin) : undefined,
    }));
    this.descriptorItems = obra.descriptores || [];
    this.vinculoItems = obra.vinculosRelacionados || [];
    this.proyectosItems = (obra.proyectos || []).map((p: any) => {
      const id = p.id || p;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.obraForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected addDenominacion() {
    const dr = this.denominacionControl.value;
    const fd = this.fuenteDenominacionControl.value;
    if (!dr || !fd) return;
    this.denominacionItems = [...this.denominacionItems, { denominacionRegional: dr, fuenteDenominacion: fd }];
    this.denominacionControl.reset();
    this.fuenteDenominacionControl.reset();
  }

  protected removeDenominacion(index: number) {
    this.denominacionItems = this.denominacionItems.filter((_, i) => i !== index);
  }

  protected addActor() {
    const actor = this.actorSelection[0];
    const rol = this.actorRolControl.value;
    if (!actor || !rol) return;
    this.actorItems = [...this.actorItems, { id: actor._id, rol }];
    this.actorSelection = [];
    this.actorRolControl.reset();
  }

  protected removeActor(index: number) {
    this.actorItems = this.actorItems.filter((_, i) => i !== index);
  }

  protected getActorNombre(id: string): string {
    if (!id) return '';
    const found = this.allActores().find((a: any) => a._id === id || a.id === id);
    return found ? formatActorName(found) || '(cargando...)' : '(cargando...)';
  }

  protected addSistema() {
    const sis = this.sistemaSelection[0];
    if (!sis) return;
    this.sistemaItems = [...this.sistemaItems, { id: sis._id, centro: this.sistemaCentroControl.value || '' }];
    this.sistemaSelection = [];
    this.sistemaCentroControl.reset();
  }

  protected removeSistema(index: number) {
    this.sistemaItems = this.sistemaItems.filter((_, i) => i !== index);
  }

  protected getSistemaNombre(id: string): string {
    if (!id) return '';
    const found = this.allSistemas().find((s: any) => s._id === id || s.id === id);
    return found?.nombre || '(cargando...)';
  }

  protected addAsientoLigado() {
    const obra = this.asientoObraSelection[0];
    if (!obra) return;
    const proy = this.asientoProyectoSelection[0];
    this.asientoItems = [...this.asientoItems, {
      id: obra._id,
      tipoDeRelacion: this.asientoTipoControl.value || '',
      direccionDeRelacion: this.asientoDireccionControl.value || '',
      fuenteAutorRelacion: this.asientoFuenteControl.value || '',
      notaGeneral: this.asientoNotaControl.value || '',
      proyectoRelacionado: proy?._id || '',
    }];
    this.asientoObraSelection = [];
    this.asientoProyectoSelection = [];
    this.asientoTipoControl.reset();
    this.asientoDireccionControl.reset();
    this.asientoFuenteControl.reset();
    this.asientoNotaControl.reset();
  }

  protected removeAsiento(index: number) {
    this.asientoItems = this.asientoItems.filter((_, i) => i !== index);
  }

  protected getObraNombre(id: string): string {
    if (!id) return '';
    const found = this.allObras().find((o: any) => o._id === id || o.id === id);
    return found?.titulo || '(cargando...)';
  }

  protected addDescriptor() {
    const etiqueta = this.descEtiquetaControl.value;
    const contenido = this.descContenidoControl.value;
    if (!etiqueta || !contenido) return;
    this.descriptorItems = [...this.descriptorItems, { etiqueta, contenido }];
    this.descEtiquetaControl.reset();
    this.descContenidoControl.reset();
  }

  protected removeDescriptor(index: number) {
    this.descriptorItems = this.descriptorItems.filter((_, i) => i !== index);
  }

  protected addVinculo() {
    const url = this.vinculoUrlControl.value;
    if (!url) return;
    this.vinculoItems = [...this.vinculoItems, { etiqueta: this.vinculoEtiquetaControl.value || '', url }];
    this.vinculoUrlControl.reset();
    this.vinculoEtiquetaControl.reset();
  }

  protected removeVinculo(index: number) {
    this.vinculoItems = this.vinculoItems.filter((_, i) => i !== index);
  }

  protected onContenedoresChange(items: any[]) { this.contenedoresItems = items; }
  protected onActorChange(items: any[]) { this.actorSelection = items; }
  protected onGenerosFormasChange(items: any[]) { this.generosFormasItems = items; }
  protected onGenerosNoMusicalesChange(items: any[]) { this.generosNoMusicalesItems = items; }
  protected onMateriasChange(items: any[]) { this.materiaItems = items; }
  protected onMediosChange(items: any[]) { this.medioItems = items; }
  protected onSistemaChange(items: any[]) { this.sistemaSelection = items; }
  protected onIdiomasChange(items: any[]) { this.idiomaItems = items; }
  protected onProyectosChange(items: any[]) { this.proyectosItems = items; }
  protected onAsientoObraChange(items: any[]) { this.asientoObraSelection = items; }
  protected onAsientoProyectoChange(items: any[]) { this.asientoProyectoSelection = items; }

  protected onFileUploaded(file: FileBasicInfo) {
    this.archivosAdjuntosItems = [...this.archivosAdjuntosItems, { archivoId: file.id }];
  }

  protected onFileDeleted(file: FileDeleteInfo) {
    this.archivosAdjuntosItems = this.archivosAdjuntosItems.filter((f) => f.archivoId !== file.id);
  }

  protected onSubmit() {
    if (this.obraForm.invalid) return;

    const payload: any = {
      titulo: this.obraForm.value.titulo,
      descripcion: this.obraForm.value.descripcion || '',
      tipo: this.obraForm.value.tipo || '',
      denominacionRegional: this.denominacionItems,
      contenedores: this.contenedoresItems.map((c) => ({ id: c._id })),
      actores: this.actorItems,
      generosFormas: this.generosFormasItems.map((g) => ({ id: g._id })),
      GenerosFormasNoMusicales: this.generosNoMusicalesItems.map((g) => ({ id: g._id })),
      materias: this.materiaItems.map((m) => ({ id: m._id })),
      mediosSonoros: this.medioItems.map((m) => ({ id: m._id })),
      sistemasSonoros: this.sistemaItems,
      idiomas: this.idiomaItems.map((i) => ({ id: i._id })),
      asientoLigado: this.asientoItems,
      anotacionCartograficoTemporal: this.anotacionesItems,
      descriptores: this.descriptorItems,
      vinculosRelacionados: this.vinculoItems,
      proyectos: this.proyectosItems.map((p) => ({ id: p._id })),
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.obraId) {
      this.obrasService.update(this.obraId, payload).subscribe({
        next: () => this.router.navigate(['/obras', this.obraId]),
        error: (err) => {
          console.error('[ObraForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar la obra');
        },
      });
    } else {
      this.obrasService.create(payload).subscribe({
        next: () => this.router.navigate(['/obras']),
        error: (err) => {
          console.error('[ObraForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear la obra');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/obras']);
  }
}
