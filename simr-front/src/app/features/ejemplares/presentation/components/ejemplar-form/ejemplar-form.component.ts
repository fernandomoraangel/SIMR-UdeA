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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@env/environment';
import { EjemplaresStore } from '../../../state/ejemplares.store';
import { EjemplaresService } from '../../../data/ejemplares.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { HelpPopupComponent } from '../../../../../shared/help-popup/help-popup.component';
import { AutocompleteCreateComponent, AutocompleteItem } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import { EstadoRelacionado } from '../../../domain/ejemplar.interface';

@Component({
  selector: 'app-ejemplar-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent, HelpPopupComponent,
    AutocompleteCreateComponent,
  ],
  providers: [EjemplaresStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Ejemplar' : 'Nuevo Ejemplar' }}</h1>
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

      <mat-card class="ejemplar-form" appearance="outlined">
        <form [formGroup]="ejemplarForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Número de ejemplar *</mat-label>
              <input matInput formControlName="numeroEjemplar" placeholder="Ej: 001" />
              <app-help-popup tabla="Ejemplar" campo="numeroEjemplar" />
              @if (isFieldInvalid('numeroEjemplar')) {
                <mat-error>El número de ejemplar es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Procedencia</mat-label>
              <input matInput formControlName="procedencia" placeholder="Ej: Donación particular" />
              <app-help-popup tabla="Ejemplar" campo="procedencia" />
            </mat-form-field>
          </div>

          <app-collapsible-section title="Recurso asociado" icon="library_music">
            <div class="section-content">
              <app-autocomplete-create
                apiEndpoint="recursos"
                placeholder="Buscar recurso…"
                displayField="titulo"
                [selected]="recursoSelected()"
                (selectedChange)="onRecursoChange($event)"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Ubicación" icon="location_on">
            <div class="section-content">
              <div class="inline-fields">
                <div class="field-wrapper">
                  <p class="field-label">Fondo</p>
                  <app-autocomplete-create
                    apiEndpoint="fondos"
                    placeholder="Buscar fondo…"
                    displayField="nombre"
                    [selected]="fondoSelected()"
                    (selectedChange)="onFondoChange($event)"
                  />
                </div>
                <div class="field-wrapper">
                  <p class="field-label">Colección</p>
                  <app-autocomplete-create
                    apiEndpoint="colecciones"
                    placeholder="Buscar colección…"
                    displayField="nombre"
                    [selected]="coleccionSelected()"
                    (selectedChange)="onColeccionChange($event)"
                  />
                </div>
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Disponibilidad" icon="check_circle">
            <div class="section-content">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Disponibilidad</mat-label>
                <mat-select formControlName="disponibilidad">
                  <mat-option value="">—</mat-option>
                  @for (d of disponibilidadOptions(); track d) {
                    <mat-option [value]="d">{{ d }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Estados" icon="flag">
            <div class="section-content">
              <div class="inline-editor">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-medio">
                  <mat-label>Etiqueta</mat-label>
                  <mat-select [formControl]="estadoEtiquetaControl">
                    <mat-option value="">—</mat-option>
                    @for (et of estadoOptions(); track et) {
                      <mat-option [value]="et">{{ et }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo-largo">
                  <mat-label>Contenido</mat-label>
                  <input matInput [formControl]="estadoContenidoControl" placeholder="Descripción del estado" />
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addEstado()" [disabled]="!estadoEtiquetaControl.value || !estadoContenidoControl.value?.trim()">
                  <mat-icon>add</mat-icon>
                  Agregar
                </button>
              </div>
              @if (estadosItems.length > 0) {
                <div class="items-list">
                  @for (est of estadosItems; track $index) {
                    <div class="rel-item">
                      <span class="rel-nombre">{{ est.etiqueta }}</span>
                      <span class="rel-detalle">{{ est.contenido }}</span>
                      <button mat-icon-button (click)="removeEstado($index)" color="warn" matTooltip="Eliminar" type="button">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-hint">No hay estados registrados.</p>
              }
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="ejemplarForm.invalid || store.isLoading()">
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
    .ejemplar-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; }
    .inline-fields { display: flex; flex-direction: column; gap: 1rem; }
    .field-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--simr-tinta-2); margin: 0; letter-spacing: 0.05em; }
    .inline-editor { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.5rem; margin-bottom: 0.75rem; }
    .campo-largo { flex: 1; min-width: 160px; }
    .campo-medio { width: 180px; }
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
      .campo-largo, .campo-medio { width: 100%; }
    }
  `],
})
export class EjemplarFormComponent implements OnInit {
  protected readonly store = inject(EjemplaresStore);
  private readonly ejemplaresService = inject(EjemplaresService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected ejemplarId: string | null = null;

  protected recursoSelected = signal<AutocompleteItem[]>([]);
  protected fondoSelected = signal<AutocompleteItem[]>([]);
  protected coleccionSelected = signal<AutocompleteItem[]>([]);

  protected disponibilidadOptions = signal<string[]>([]);
  protected estadoOptions = signal<string[]>([]);

  protected estadosItems: EstadoRelacionado[] = [];
  protected documentId = signal<string>('');

  protected estadoEtiquetaControl = this.fb.control<string>('');
  protected estadoContenidoControl = this.fb.control<string>('');

  ejemplarForm: FormGroup = this.fb.group({
    numeroEjemplar: ['', Validators.required],
    procedencia: [''],
    disponibilidad: [''],
    recurso: [''],
    fondo: [''],
    coleccion: [''],
  });

  constructor() {
    effect(() => {
      const ejemplar = this.store.selectedEjemplar();
      if (ejemplar && this.isEditMode) {
        this.loadEjemplarData(ejemplar);
      }
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.ejemplarId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/ejemplares/${id}`).subscribe({
          next: (ejemplar: any) => this.loadEjemplarData(ejemplar),
          error: (err) => console.error('[EjemplarForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/listas/disponibilidades`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.disponibilidadOptions.set(Array.isArray(list) ? list : []);
      },
      error: () => this.disponibilidadOptions.set([]),
    });
    this.http.get(`${apiUrl}/listas/estados`).subscribe({
      next: (data: any) => {
        const list = data?.elementos || data?.data?.elementos || data || [];
        this.estadoOptions.set(Array.isArray(list) ? list : []);
      },
      error: () => this.estadoOptions.set([]),
    });
  }

  private loadEjemplarData(ejemplar: any) {
    this.ejemplarForm.patchValue({
      numeroEjemplar: ejemplar.numeroEjemplar || '',
      procedencia: ejemplar.procedencia || '',
      disponibilidad: ejemplar.disponibilidad || '',
    });
    this.estadosItems = ejemplar.estados || [];

    if (ejemplar.recurso) {
      this.http.get(`${environment.apiUrl}/recursos/${ejemplar.recurso}`).subscribe({
        next: (rec: any) => {
          this.recursoSelected.set([{ _id: rec._id, titulo: rec.titulo || rec.nombre || '', nombre: rec.nombre || rec.titulo || '' }]);
        },
        error: () => {
          this.recursoSelected.set([{ _id: ejemplar.recurso, nombre: '(cargando…)', titulo: '(cargando…)' }]);
        },
      });
    }
    if (ejemplar.fondo) {
      this.http.get(`${environment.apiUrl}/fondos/${ejemplar.fondo}`).subscribe({
        next: (f: any) => {
          this.fondoSelected.set([{ _id: f._id, nombre: f.nombre || '' }]);
        },
        error: () => {
          this.fondoSelected.set([{ _id: ejemplar.fondo, nombre: '(cargando…)' }]);
        },
      });
    }
    if (ejemplar.coleccion) {
      this.http.get(`${environment.apiUrl}/colecciones/${ejemplar.coleccion}`).subscribe({
        next: (c: any) => {
          this.coleccionSelected.set([{ _id: c._id, nombre: c.nombre || '' }]);
        },
        error: () => {
          this.coleccionSelected.set([{ _id: ejemplar.coleccion, nombre: '(cargando…)' }]);
        },
      });
    }
  }

  protected onRecursoChange(items: AutocompleteItem[]) {
    this.recursoSelected.set(items.length > 0 ? [items[items.length - 1]] : []);
  }

  protected onFondoChange(items: AutocompleteItem[]) {
    this.fondoSelected.set(items.length > 0 ? [items[items.length - 1]] : []);
  }

  protected onColeccionChange(items: AutocompleteItem[]) {
    this.coleccionSelected.set(items.length > 0 ? [items[items.length - 1]] : []);
  }

  protected addEstado() {
    const etiqueta = this.estadoEtiquetaControl.value;
    const contenido = this.estadoContenidoControl.value;
    if (!etiqueta || !contenido?.trim()) return;
    this.estadosItems = [...this.estadosItems, { etiqueta, contenido: contenido.trim() }];
    this.estadoEtiquetaControl.reset();
    this.estadoContenidoControl.reset();
  }

  protected removeEstado(index: number) {
    this.estadosItems = this.estadosItems.filter((_, i) => i !== index);
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.ejemplarForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onSubmit() {
    if (this.ejemplarForm.invalid) return;

    const recursoId = this.recursoSelected().length > 0 ? this.recursoSelected()[0]._id : undefined;
    const fondoId = this.fondoSelected().length > 0 ? this.fondoSelected()[0]._id : undefined;
    const coleccionId = this.coleccionSelected().length > 0 ? this.coleccionSelected()[0]._id : undefined;

    const payload: any = {
      numeroEjemplar: this.ejemplarForm.value.numeroEjemplar,
      procedencia: this.ejemplarForm.value.procedencia || '',
      disponibilidad: this.ejemplarForm.value.disponibilidad || '',
      recurso: recursoId || null,
      fondo: fondoId || null,
      coleccion: coleccionId || null,
      estados: this.estadosItems,
    };

    if (this.isEditMode && this.ejemplarId) {
      this.ejemplaresService.update(this.ejemplarId, payload).subscribe({
        next: () => this.router.navigate(['/ejemplares', this.ejemplarId]),
        error: (err) => {
          console.error('[EjemplarForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el ejemplar');
        },
      });
    } else {
      this.ejemplaresService.create(payload).subscribe({
        next: () => this.router.navigate(['/ejemplares']),
        error: (err) => {
          console.error('[EjemplarForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el ejemplar');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/ejemplares']);
  }
}
