import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ActoresStore } from '../../../data/actores.store';
import { ActoresService } from '../../../data/actores.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';

@Component({
  selector: 'app-actor-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule,
    MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
    AutocompleteCreateComponent,
    ArchivoManagerComponent,
  ],
  providers: [ActoresStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Actor' : 'Nuevo Actor' }}</h1>
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

      <mat-card class="actor-form" appearance="outlined">
        <form [formGroup]="actorForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombres</mat-label>
              <input matInput formControlName="nombres" placeholder="Ej: Ludwig van" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Apellidos</mat-label>
              <input matInput formControlName="apellidos" placeholder="Ej: Beethoven" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre artístico</mat-label>
              <input matInput formControlName="nombreArtistico" placeholder="Ej: El piano de Beethoven" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre de reunión</mat-label>
              <input matInput formControlName="nombreReunion" placeholder="Ej: Beethoven (Ludwig van)" />
            </mat-form-field>
            @if (actorForm.errors?.['requiredActorName'] && actorForm.touched) {
              <p class="error-text">Debe ingresar al menos Nombre y Apellido, Nombre artístico o Nombre de reunión.</p>
            }
          </div>

          <app-collapsible-section title="Contenedores (actores asociados)" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="actores"
                placeholder="Buscar actor..."
                displayField="fullName"
                [selected]="contenedorItems"
                (selectedChange)="onContenedorChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Anotaciones cartográfico-temporales" icon="map" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Evento</mat-label>
                  <input matInput [formControl]="ctEventoControl" placeholder="Ej: Nacimiento" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Fecha inicio</mat-label>
                  <input matInput [formControl]="ctFechaInicioControl" placeholder="AAAA-MM-DD" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Fecha fin</mat-label>
                  <input matInput [formControl]="ctFechaFinControl" placeholder="AAAA-MM-DD" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addCT()" [disabled]="!ctEventoControl.value">
                  <mat-icon>add</mat-icon> Agregar
                </button>
              </div>
              @if (ctItems.length > 0) {
                <div class="items-list">
                  @for (c of ctItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ c.evento }}</span>
                      <span class="rel-detalle">{{ c.fechaInicio || '?' }} – {{ c.fechaFin || '?' }}</span>
                      <button mat-icon-button (click)="removeCT($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay anotaciones cartográfico-temporales.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Descriptores" icon="label" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Etiqueta</mat-label>
                  <input matInput [formControl]="descEtiquetaControl" placeholder="Etiqueta" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Contenido</mat-label>
                  <input matInput [formControl]="descContenidoControl" placeholder="Contenido" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addDescriptor()"
                  [disabled]="!descEtiquetaControl.value || !descContenidoControl.value">
                  <mat-icon>add</mat-icon> Agregar
                </button>
              </div>
              @if (descItems.length > 0) {
                <div class="items-list">
                  @for (d of descItems; track $index) {
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
                <p class="empty-hint">No hay descriptores.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Vínculos relacionados" icon="language" [collapsed]="true">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>URL</mat-label>
                  <input matInput [formControl]="vinculoUrlControl" placeholder="https://..." />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Etiqueta</mat-label>
                  <input matInput [formControl]="vinculoEtiquetaControl" placeholder="Descripción" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addVinculo()" [disabled]="!vinculoUrlControl.value">
                  <mat-icon>add</mat-icon> Agregar
                </button>
              </div>
              @if (vinculoItems.length > 0) {
                <div class="items-list">
                  @for (v of vinculoItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ v.etiqueta || 'Vínculo' }}</span>
                      <span class="rel-detalle">{{ v.url }}</span>
                      <button mat-icon-button (click)="removeVinculo($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay vínculos registrados.</p>
              }
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="documentId()"
                collection="actores"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
              />
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="actorForm.invalid || store.isLoading()">
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
    .actor-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .error-text { font-size: 0.82rem; color: var(--simr-sello); margin: -0.5rem 0 0; padding: 0; }
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
export class ActorFormComponent implements OnInit {
  protected readonly store = inject(ActoresStore);
  private readonly actoresService = inject(ActoresService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected actorId: string | null = null;

  protected contenedorItems: any[] = [];
  protected ctItems: any[] = [];
  protected descItems: { etiqueta: string; contenido: string }[] = [];
  protected vinculoItems: { etiqueta: string; url: string }[] = [];
  protected archivoItems: { archivo: string; descripcion: string }[] = [];

  protected documentId = signal<string>('');

  // Inline controls
  protected ctEventoControl = this.fb.control<string | null>(null);
  protected ctFechaInicioControl = this.fb.control<string | null>(null);
  protected ctFechaFinControl = this.fb.control<string | null>(null);
  protected descEtiquetaControl = this.fb.control<string | null>(null);
  protected descContenidoControl = this.fb.control<string | null>(null);
  protected vinculoUrlControl = this.fb.control<string | null>(null);
  protected vinculoEtiquetaControl = this.fb.control<string | null>(null);

  actorForm: FormGroup = this.fb.group({
    nombres: [''],
    apellidos: [''],
    nombreArtistico: [''],
    nombreReunion: [''],
  }, { validators: this.actorNameValidator });

  constructor() {
    effect(() => {
      const actor = this.store.selectedActor();
      if (actor && this.isEditMode) {
        this.loadActorData(actor);
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.actorId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/actores/${id}`).subscribe({
          next: (actor: any) => this.loadActorData(actor),
          error: (err) => console.error('[ActorForm] error al cargar', err),
        });
      }
    });
  }

  private loadActorData(actor: any) {
    this.actorForm.patchValue({
      nombres: actor.nombres || '',
      apellidos: actor.apellidos || '',
      nombreArtistico: actor.nombreArtistico || '',
      nombreReunion: actor.nombreReunion || '',
    });
    this.contenedorItems = (actor.contenedor || []).map((c: any) => {
      const ref = c.id || c;
      if (typeof ref === 'object') return { _id: ref._id, fullName: ref.fullName };
      return { _id: ref, fullName: '(cargando...)' };
    });
    this.ctItems = actor.anotacionCartograficoTemporal || [];
    this.descItems = actor.descriptores || [];
    this.vinculoItems = actor.vinculoRelacionado || [];
    this.archivoItems = (actor.archivosAdjuntos || []).map((a: any) => ({
      archivo: a.archivo || a.id || a._id,
      descripcion: a.descripcion || '',
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.actorForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected actorNameValidator(group: AbstractControl) {
    const nombres = group.get('nombres')?.value?.trim();
    const apellidos = group.get('apellidos')?.value?.trim();
    const artistico = group.get('nombreArtistico')?.value?.trim();
    const reunion = group.get('nombreReunion')?.value?.trim();

    if ((nombres && apellidos) || artistico || reunion) {
      return null;
    }
    return { requiredActorName: true };
  }

  protected onContenedorChange(items: any[]) {
    this.contenedorItems = items;
  }

  protected addCT() {
    const evento = this.ctEventoControl.value;
    if (!evento) return;
    this.ctItems = [...this.ctItems, {
      evento,
      fechaInicio: this.ctFechaInicioControl.value || undefined,
      fechaFin: this.ctFechaFinControl.value || undefined,
    }];
    this.ctEventoControl.reset();
    this.ctFechaInicioControl.reset();
    this.ctFechaFinControl.reset();
  }

  protected removeCT(index: number) {
    this.ctItems = this.ctItems.filter((_, i) => i !== index);
  }

  protected addDescriptor() {
    const etiqueta = this.descEtiquetaControl.value;
    const contenido = this.descContenidoControl.value;
    if (!etiqueta || !contenido) return;
    this.descItems = [...this.descItems, { etiqueta, contenido }];
    this.descEtiquetaControl.reset();
    this.descContenidoControl.reset();
  }

  protected removeDescriptor(index: number) {
    this.descItems = this.descItems.filter((_, i) => i !== index);
  }

  protected addVinculo() {
    const url = this.vinculoUrlControl.value;
    if (!url) return;
    this.vinculoItems = [...this.vinculoItems, {
      url,
      etiqueta: this.vinculoEtiquetaControl.value || '',
    }];
    this.vinculoUrlControl.reset();
    this.vinculoEtiquetaControl.reset();
  }

  protected removeVinculo(index: number) {
    this.vinculoItems = this.vinculoItems.filter((_, i) => i !== index);
  }

  protected onFileUploaded(file: FileBasicInfo) {
    this.archivoItems = [...this.archivoItems, { archivo: file.id, descripcion: '' }];
  }

  protected onFileDeleted(file: FileDeleteInfo) {
    this.archivoItems = this.archivoItems.filter((f) => f.archivo !== file.id);
  }

  protected onSubmit() {
    if (this.actorForm.invalid) return;

    const payload: any = {
      nombres: this.actorForm.value.nombres,
      apellidos: this.actorForm.value.apellidos,
      nombreArtistico: this.actorForm.value.nombreArtistico || '',
      nombreReunion: this.actorForm.value.nombreReunion || '',
      contenedor: this.contenedorItems.map((c) => ({ id: c._id })),
      anotacionCartograficoTemporal: this.ctItems,
      descriptores: this.descItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivoItems,
    };

    if (this.isEditMode && this.actorId) {
      this.actoresService.update(this.actorId, payload).subscribe({
        next: () => this.router.navigate(['/actores', this.actorId]),
        error: (err) => {
          console.error('[ActorForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el actor');
        },
      });
    } else {
      this.actoresService.create(payload).subscribe({
        next: () => this.router.navigate(['/actores']),
        error: (err) => {
          console.error('[ActorForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el actor');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/actores']);
  }
}
