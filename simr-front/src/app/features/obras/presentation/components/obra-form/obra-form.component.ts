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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ObrasStore } from '../../../data/obras.store';
import { ObrasService } from '../../../data/obras.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { ListEditorComponent } from '../../../../../shared/list-editor/list-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';

interface ContextoItem { contexto: string; descripcion: string }
interface ActorAsociadoItem { actor: any; rol: string }
interface NotaProgramaItem { titulo: string; contenido: string; fecha: string }
interface FechaAsociadaItem { fecha: string; tipo: string; descripcion: string }
interface AnotacionItem { titulo: string; anotacion: string }
interface EnlaceItem { url: string; descripcion: string }
interface ArchivoAdjuntoItem { archivo: string; descripcion: string }

@Component({
  selector: 'app-obra-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule,
    MatDatepickerModule,
    CollapsibleSectionComponent,
    AutocompleteCreateComponent,
    ListEditorComponent,
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
              <mat-label>Título *</mat-label>
              <input matInput formControlName="titulo" placeholder="Ej: Sinfonía No. 5 en Do menor" />
              @if (isFieldInvalid('titulo')) {
                <mat-error>El título es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Título original</mat-label>
              <input matInput formControlName="tituloOriginal" placeholder="Título en lengua original" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Lugar de ejecución</mat-label>
              <input matInput formControlName="lugarDeEjecucion" placeholder="Ej: Viena" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Año de estreno</mat-label>
              <input matInput formControlName="anyoEstreno" placeholder="Ej: 1808" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Duración</mat-label>
              <input matInput formControlName="duracion" placeholder="Ej: 35 min" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Estado</mat-label>
              <input matInput formControlName="estado" placeholder="Ej: Terminada, En proceso..." />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción de la obra..."></textarea>
            </mat-form-field>
          </div>

          <div class="form-section">
            <p class="subtitulo">Tipos de obra</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Tipo</mat-label>
                <mat-select [formControl]="tipoObraControl">
                  @for (t of listaTiposDeObra(); track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addTipoObra()"
                [disabled]="!tipoObraControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (tipoDeObraItems.length > 0) {
              <div class="items-list">
                @for (t of tipoDeObraItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ t }}</span>
                    <button mat-icon-button (click)="removeTipoObra($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay tipos de obra.</p>
            }

            <p class="subtitulo">Ámbitos geográficos</p>
            <div class="inline-editor">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                <mat-label>Ámbito</mat-label>
                <mat-select [formControl]="ambitoGeograficoControl">
                  @for (a of listaAmbitosGeograficos(); track a) {
                    <mat-option [value]="a">{{ a }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="addAmbitoGeografico()"
                [disabled]="!ambitoGeograficoControl.value">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
            @if (ambitoGeograficoItems.length > 0) {
              <div class="items-list">
                @for (a of ambitoGeograficoItems; track $index) {
                  <div class="rel-item">
                    <span class="rel-nombre">{{ a }}</span>
                    <button mat-icon-button (click)="removeAmbitoGeografico($index)" color="warn" matTooltip="Eliminar" type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-hint">No hay ámbitos geográficos.</p>
            }
          </div>

          <app-collapsible-section title="Contextos" icon="description" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Contexto</mat-label>
                  <input matInput [formControl]="contextoContextoControl" placeholder="Ej: Político" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Descripción</mat-label>
                  <input matInput [formControl]="contextoDescripcionControl" placeholder="Descripción del contexto" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addContexto()"
                  [disabled]="!contextoContextoControl.value || !contextoDescripcionControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (contextoItems.length > 0) {
                <div class="items-list">
                  @for (c of contextoItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ c.contexto }}</span>
                      <span class="rel-detalle">{{ c.descripcion }}</span>
                      <button mat-icon-button (click)="removeContexto($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay contextos registrados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Obras vinculadas" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="obras"
                placeholder="Buscar obra..."
                displayField="titulo"
                [selected]="obrasVinculadasItems"
                (selectedChange)="onObrasVinculadasChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Recursos vinculados" icon="inventory" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="recursos"
                placeholder="Buscar recurso..."
                displayField="titulo"
                [selected]="recursosVinculadosItems"
                (selectedChange)="onRecursosVinculadosChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Actores" icon="people" [collapsed]="true">
            <div class="section-content">
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
                  <input matInput [formControl]="actorRolControl" placeholder="Ej: Compositor" />
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
                      <span class="rel-nombre">{{ getActorNombre(a.actor) }}</span>
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
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Proyectos" icon="folder" [collapsed]="true">
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

          <app-collapsible-section title="Géneros" icon="music_note" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="generos"
                placeholder="Buscar género..."
                displayField="nombre"
                [selected]="generosItems"
                (selectedChange)="onGenerosChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Instrumentos" icon="straighten" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="instrumentos"
                placeholder="Buscar instrumento..."
                displayField="nombre"
                [selected]="instrumentosItems"
                (selectedChange)="onInstrumentosChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Notas de programa" icon="notes" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Título</mat-label>
                  <input matInput [formControl]="notaTituloControl" placeholder="Título de la nota" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Contenido</mat-label>
                  <input matInput [formControl]="notaContenidoControl" placeholder="Contenido de la nota" />
                </mat-form-field>
              </div>
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Fecha</mat-label>
                  <input matInput [formControl]="notaFechaControl" placeholder="AAAA-MM-DD" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addNotaPrograma()"
                  [disabled]="!notaTituloControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (notasProgramaItems.length > 0) {
                <div class="items-list">
                  @for (n of notasProgramaItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ n.titulo }}</span>
                      <span class="rel-detalle">{{ n.contenido }} @if (n.fecha) { — {{ n.fecha }} }</span>
                      <button mat-icon-button (click)="removeNotaPrograma($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay notas de programa.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Fechas asociadas" icon="event" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Fecha</mat-label>
                  <input matInput [formControl]="fechaFechaControl" placeholder="AAAA-MM-DD" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Tipo</mat-label>
                  <input matInput [formControl]="fechaTipoControl" placeholder="Ej: Estreno" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Descripción</mat-label>
                  <input matInput [formControl]="fechaDescripcionControl" placeholder="Descripción" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addFechaAsociada()"
                  [disabled]="!fechaFechaControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (fechasAsociadasItems.length > 0) {
                <div class="items-list">
                  @for (f of fechasAsociadasItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ f.tipo }}</span>
                      <span class="rel-detalle">{{ f.fecha }} @if (f.descripcion) { — {{ f.descripcion }} }</span>
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

          <app-collapsible-section title="Anotaciones" icon="comment" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Título</mat-label>
                  <input matInput [formControl]="anotacionTituloControl" placeholder="Título de la anotación" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Anotación</mat-label>
                  <input matInput [formControl]="anotacionTextoControl" placeholder="Contenido de la anotación" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addAnotacion()"
                  [disabled]="!anotacionTituloControl.value || !anotacionTextoControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (anotacionItems.length > 0) {
                <div class="items-list">
                  @for (a of anotacionItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ a.titulo }}</span>
                      <span class="rel-detalle">{{ a.anotacion }}</span>
                      <button mat-icon-button (click)="removeAnotacion($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay anotaciones.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Descriptores" icon="label" [collapsed]="true">
            <div class="section-content">
              <app-list-editor
                [value]="descriptorItems"
                placeholder="Agregar descriptor…"
                (valueChange)="descriptorItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Enlaces" icon="language" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>URL</mat-label>
                  <input matInput [formControl]="enlaceUrlControl" placeholder="https://..." />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Descripción</mat-label>
                  <input matInput [formControl]="enlaceDescripcionControl" placeholder="Descripción del enlace" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addEnlace()"
                  [disabled]="!enlaceUrlControl.value">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (enlaceItems.length > 0) {
                <div class="items-list">
                  @for (e of enlaceItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ e.descripcion || 'Enlace' }}</span>
                      <span class="rel-detalle">{{ e.url }}</span>
                      <button mat-icon-button (click)="removeEnlace($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay enlaces registrados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="documentId()"
                collection="obras"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
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
export class ObraFormComponent implements OnInit {
  protected readonly store = inject(ObrasStore);
  private readonly obrasService = inject(ObrasService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected obraId: string | null = null;

  protected tipoDeObraItems: string[] = [];
  protected ambitoGeograficoItems: string[] = [];
  protected contextoItems: ContextoItem[] = [];
  protected obrasVinculadasItems: any[] = [];
  protected recursosVinculadosItems: any[] = [];
  protected actorItems: ActorAsociadoItem[] = [];
  protected actorSelection: any[] = [];
  protected proyectosItems: any[] = [];
  protected generosItems: any[] = [];
  protected instrumentosItems: any[] = [];
  protected notasProgramaItems: NotaProgramaItem[] = [];
  protected fechasAsociadasItems: FechaAsociadaItem[] = [];
  protected anotacionItems: AnotacionItem[] = [];
  protected descriptorItems: string[] = [];
  protected enlaceItems: EnlaceItem[] = [];
  protected archivosAdjuntosItems: ArchivoAdjuntoItem[] = [];

  protected listaTiposDeObra = signal<string[]>([]);
  protected listaAmbitosGeograficos = signal<string[]>([]);
  protected documentId = signal<string>('');

  protected tipoObraControl = this.fb.control<string | null>(null);
  protected ambitoGeograficoControl = this.fb.control<string | null>(null);
  protected contextoContextoControl = this.fb.control<string | null>(null);
  protected contextoDescripcionControl = this.fb.control<string | null>(null);
  protected actorRolControl = this.fb.control<string | null>(null);
  protected notaTituloControl = this.fb.control<string | null>(null);
  protected notaContenidoControl = this.fb.control<string | null>(null);
  protected notaFechaControl = this.fb.control<string | null>(null);
  protected fechaFechaControl = this.fb.control<string | null>(null);
  protected fechaTipoControl = this.fb.control<string | null>(null);
  protected fechaDescripcionControl = this.fb.control<string | null>(null);
  protected anotacionTituloControl = this.fb.control<string | null>(null);
  protected anotacionTextoControl = this.fb.control<string | null>(null);
  protected enlaceUrlControl = this.fb.control<string | null>(null);
  protected enlaceDescripcionControl = this.fb.control<string | null>(null);

  obraForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    tituloOriginal: [''],
    lugarDeEjecucion: [''],
    anyoEstreno: [''],
    descripcion: [''],
    duracion: [''],
    estado: [''],
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
          next: (obra: any) => {
            this.loadObraData(obra);
          },
          error: (err) => console.error('[ObraForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/listas/tiposDeObra`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaTiposDeObra.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaTiposDeObra.set([]),
    });
    this.http.get(`${apiUrl}/listas/ambitosGeograficos`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.listaAmbitosGeograficos.set(Array.isArray(list) ? list : []);
      },
      error: () => this.listaAmbitosGeograficos.set([]),
    });
  }

  private loadObraData(obra: any) {
    this.obraForm.patchValue({
      titulo: obra.titulo || '',
      tituloOriginal: obra.tituloOriginal || '',
      lugarDeEjecucion: obra.lugarDeEjecucion || '',
      anyoEstreno: obra.anyoEstreno || '',
      descripcion: obra.descripcion || '',
      duracion: obra.duracion || '',
      estado: obra.estado || '',
    });
    this.tipoDeObraItems = obra.tipoDeObra || [];
    this.ambitoGeograficoItems = obra.ambitoGeografico || [];
    this.contextoItems = obra.contextos || [];
    this.obrasVinculadasItems = (obra.obrasVinculadas || []).map((o: any) => {
      const id = o.id || o;
      if (typeof id === 'object') return { _id: id._id, titulo: id.titulo };
      return { _id: id, titulo: '(cargando...)' };
    });
    this.recursosVinculadosItems = (obra.recursosVinculados || []).map((r: any) => {
      const id = r.id || r;
      if (typeof id === 'object') return { _id: id._id, titulo: id.titulo };
      return { _id: id, titulo: '(cargando...)' };
    });
    this.actorItems = (obra.actores || []).map((a: any) => ({
      actor: a.actor || a.id,
      rol: a.rol || '',
    }));
    this.proyectosItems = (obra.proyectos || []).map((p: any) => {
      const id = p.id || p;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.generosItems = (obra.generos || []).map((g: any) => {
      const id = g.id || g;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.instrumentosItems = (obra.instrumentos || []).map((i: any) => {
      const id = i.id || i;
      if (typeof id === 'object') return { _id: id._id, nombre: id.nombre };
      return { _id: id, nombre: '(cargando...)' };
    });
    this.notasProgramaItems = obra.notasPrograma || [];
    this.fechasAsociadasItems = obra.fechasAsociadas || [];
    this.anotacionItems = obra.anotaciones || [];
    this.descriptorItems = obra.descriptores || [];
    this.enlaceItems = obra.enlaces || [];
    this.archivosAdjuntosItems = (obra.archivosAdjuntos || []).map((a: any) => ({
      archivo: a.archivo || a.id || a._id,
      descripcion: a.descripcion || '',
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.obraForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected addTipoObra() {
    const val = this.tipoObraControl.value;
    if (!val) return;
    if (!this.tipoDeObraItems.includes(val)) {
      this.tipoDeObraItems = [...this.tipoDeObraItems, val];
    }
    this.tipoObraControl.reset();
  }

  protected removeTipoObra(index: number) {
    this.tipoDeObraItems = this.tipoDeObraItems.filter((_, i) => i !== index);
  }

  protected addAmbitoGeografico() {
    const val = this.ambitoGeograficoControl.value;
    if (!val) return;
    if (!this.ambitoGeograficoItems.includes(val)) {
      this.ambitoGeograficoItems = [...this.ambitoGeograficoItems, val];
    }
    this.ambitoGeograficoControl.reset();
  }

  protected removeAmbitoGeografico(index: number) {
    this.ambitoGeograficoItems = this.ambitoGeograficoItems.filter((_, i) => i !== index);
  }

  protected addContexto() {
    const contexto = this.contextoContextoControl.value;
    const descripcion = this.contextoDescripcionControl.value;
    if (!contexto || !descripcion) return;
    this.contextoItems = [...this.contextoItems, { contexto, descripcion }];
    this.contextoContextoControl.reset();
    this.contextoDescripcionControl.reset();
  }

  protected removeContexto(index: number) {
    this.contextoItems = this.contextoItems.filter((_, i) => i !== index);
  }

  protected addActor() {
    const actor = this.actorSelection[0];
    const rol = this.actorRolControl.value;
    if (!actor || !rol) return;
    this.actorItems = [...this.actorItems, { actor: { _id: actor._id, fullName: actor.fullName || actor.nombre }, rol }];
    this.actorSelection = [];
    this.actorRolControl.reset();
  }

  protected removeActor(index: number) {
    this.actorItems = this.actorItems.filter((_, i) => i !== index);
  }

  protected getActorNombre(actor: any): string {
    if (!actor) return '';
    if (typeof actor === 'object' && actor.fullName) return actor.fullName;
    if (typeof actor === 'object' && actor.nombre) return actor.nombre;
    if (typeof actor === 'object' && actor._id) return '(seleccionado)';
    return typeof actor === 'string' ? actor : '';
  }

  protected addNotaPrograma() {
    const titulo = this.notaTituloControl.value;
    if (!titulo) return;
    this.notasProgramaItems = [...this.notasProgramaItems, {
      titulo,
      contenido: this.notaContenidoControl.value || '',
      fecha: this.notaFechaControl.value || '',
    }];
    this.notaTituloControl.reset();
    this.notaContenidoControl.reset();
    this.notaFechaControl.reset();
  }

  protected removeNotaPrograma(index: number) {
    this.notasProgramaItems = this.notasProgramaItems.filter((_, i) => i !== index);
  }

  protected addFechaAsociada() {
    const fecha = this.fechaFechaControl.value;
    if (!fecha) return;
    this.fechasAsociadasItems = [...this.fechasAsociadasItems, {
      fecha,
      tipo: this.fechaTipoControl.value || '',
      descripcion: this.fechaDescripcionControl.value || '',
    }];
    this.fechaFechaControl.reset();
    this.fechaTipoControl.reset();
    this.fechaDescripcionControl.reset();
  }

  protected removeFechaAsociada(index: number) {
    this.fechasAsociadasItems = this.fechasAsociadasItems.filter((_, i) => i !== index);
  }

  protected addAnotacion() {
    const titulo = this.anotacionTituloControl.value;
    const texto = this.anotacionTextoControl.value;
    if (!titulo || !texto) return;
    this.anotacionItems = [...this.anotacionItems, { titulo, anotacion: texto }];
    this.anotacionTituloControl.reset();
    this.anotacionTextoControl.reset();
  }

  protected removeAnotacion(index: number) {
    this.anotacionItems = this.anotacionItems.filter((_, i) => i !== index);
  }

  protected addEnlace() {
    const url = this.enlaceUrlControl.value;
    if (!url) return;
    this.enlaceItems = [...this.enlaceItems, {
      url,
      descripcion: this.enlaceDescripcionControl.value || '',
    }];
    this.enlaceUrlControl.reset();
    this.enlaceDescripcionControl.reset();
  }

  protected removeEnlace(index: number) {
    this.enlaceItems = this.enlaceItems.filter((_, i) => i !== index);
  }

  protected onObrasVinculadasChange(items: any[]) {
    this.obrasVinculadasItems = items;
  }

  protected onRecursosVinculadosChange(items: any[]) {
    this.recursosVinculadosItems = items;
  }

  protected onActorChange(items: any[]) {
    this.actorSelection = items;
  }

  protected onProyectosChange(items: any[]) {
    this.proyectosItems = items;
  }

  protected onGenerosChange(items: any[]) {
    this.generosItems = items;
  }

  protected onInstrumentosChange(items: any[]) {
    this.instrumentosItems = items;
  }

  protected onFileUploaded(file: FileBasicInfo) {
    this.archivosAdjuntosItems = [...this.archivosAdjuntosItems, { archivo: file.id, descripcion: '' }];
  }

  protected onFileDeleted(file: FileDeleteInfo) {
    this.archivosAdjuntosItems = this.archivosAdjuntosItems.filter((f) => f.archivo !== file.id);
  }

  protected onSubmit() {
    if (this.obraForm.invalid) return;

    const payload: any = {
      titulo: this.obraForm.value.titulo,
      tituloOriginal: this.obraForm.value.tituloOriginal || '',
      lugarDeEjecucion: this.obraForm.value.lugarDeEjecucion || '',
      anyoEstreno: this.obraForm.value.anyoEstreno || '',
      descripcion: this.obraForm.value.descripcion || '',
      duracion: this.obraForm.value.duracion || '',
      estado: this.obraForm.value.estado || '',
      tipoDeObra: this.tipoDeObraItems,
      ambitoGeografico: this.ambitoGeograficoItems,
      contextos: this.contextoItems,
      obrasVinculadas: this.obrasVinculadasItems.map((o) => ({ id: o._id })),
      recursosVinculados: this.recursosVinculadosItems.map((r) => ({ id: r._id })),
      actores: this.actorItems,
      proyectos: this.proyectosItems.map((p) => ({ id: p._id })),
      generos: this.generosItems.map((g) => ({ id: g._id })),
      instrumentos: this.instrumentosItems.map((i) => ({ id: i._id })),
      notasPrograma: this.notasProgramaItems,
      fechasAsociadas: this.fechasAsociadasItems,
      anotaciones: this.anotacionItems,
      descriptores: this.descriptorItems,
      enlaces: this.enlaceItems,
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
