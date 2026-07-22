import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@env/environment';
import { ColeccionesStore } from '../../../state/colecciones.store';
import { ColeccionesService } from '../../../data/colecciones.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import {
  CreateColeccionRequest,
  UpdateColeccionRequest,
} from '../../../domain/coleccion.interface';

@Component({
  selector: 'app-coleccion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTooltipModule,
    CollapsibleSectionComponent,
  ],
  providers: [ColeccionesStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Colección' : 'Nueva Colección' }}</h1>
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

      <mat-card class="coleccion-form" appearance="outlined">
        <form [formGroup]="coleccionForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre de la colección *</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Fondos documentales" />
              @if (isFieldInvalid('nombre')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>
          </div>

          <app-collapsible-section title="Información adicional" icon="info" [collapsed]="true">
            <div class="section-content">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Tipo</mat-label>
                <input matInput formControlName="tipo" placeholder="Ej: Documental, Sonora, Audiovisual" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="campo">
                <mat-label>Fecha de creación</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="fechaDeCreacion" />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="campo">
                <mat-label>Precisión</mat-label>
                <input matInput formControlName="precision" placeholder="Ej: Aproximada, Exacta" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="campo">
                <mat-label>Propiedad / Comodato</mat-label>
                <textarea matInput formControlName="propiedadComodato" rows="3" placeholder="Detalles de propiedad o comodato"></textarea>
              </mat-form-field>
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="coleccionForm.invalid || store.isLoading()">
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
    .coleccion-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .campo { width: 100%; min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .section-content { padding: 0.5rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
    }
  `],
})
export class ColeccionFormComponent implements OnInit {
  protected readonly store = inject(ColeccionesStore);
  private readonly coleccionesService = inject(ColeccionesService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected coleccionId: string | null = null;

  coleccionForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipo: [''],
    fechaDeCreacion: [null],
    precision: [''],
    propiedadComodato: [''],
  });

  constructor() {
    effect(() => {
      const coleccion = this.store.selectedColeccion();
      if (coleccion && this.isEditMode) {
        this.loadColeccionData(coleccion);
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.coleccionId = id;
        this.store.setInitialState();
        this.store.loadColeccionById(id);
        this.http.get(`${environment.apiUrl}/colecciones/${id}`).subscribe({
          next: (coleccion: any) => this.loadColeccionData(coleccion),
          error: (err) => console.error('[ColeccionForm] error al cargar', err),
        });
      }
    });
  }

  private loadColeccionData(coleccion: any) {
    this.coleccionForm.patchValue({
      nombre: coleccion.nombre || '',
      tipo: coleccion.tipo || '',
      fechaDeCreacion: coleccion.fechaDeCreacion ? new Date(coleccion.fechaDeCreacion) : null,
      precision: coleccion.precision || '',
      propiedadComodato: coleccion.propiedadComodato || '',
    });
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.coleccionForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onSubmit() {
    if (this.coleccionForm.invalid) return;

    const payload: any = {
      nombre: this.coleccionForm.value.nombre,
      tipo: this.coleccionForm.value.tipo || undefined,
      fechaDeCreacion: this.coleccionForm.value.fechaDeCreacion || undefined,
      precision: this.coleccionForm.value.precision || undefined,
      propiedadComodato: this.coleccionForm.value.propiedadComodato || undefined,
    };

    if (this.isEditMode && this.coleccionId) {
      this.coleccionesService.update(this.coleccionId, payload).subscribe({
        next: () => this.router.navigate(['/colecciones', this.coleccionId]),
        error: (err) => {
          console.error('[ColeccionForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar la colección');
        },
      });
    } else {
      this.coleccionesService.create(payload).subscribe({
        next: () => this.router.navigate(['/colecciones']),
        error: (err) => {
          console.error('[ColeccionForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear la colección');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/colecciones']);
  }
}
