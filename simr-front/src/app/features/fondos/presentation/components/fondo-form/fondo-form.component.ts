import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { FondosStore } from '../../../state/fondos.store';
import { FondosService } from '../../../data/fondos.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';

const PRECISION_OPTIONS = ['Año', 'Mes', 'Día', 'Hora'];

@Component({
  selector: 'app-fondo-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule,
    CollapsibleSectionComponent,
  ],
  providers: [FondosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Fondo Documental' : 'Nuevo Fondo Documental' }}</h1>
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

      <mat-card class="fondo-form" appearance="outlined">
        <form [formGroup]="fondoForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre del fondo *</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Fondo documental" />
              @if (isFieldInvalid('nombre')) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Tipo</mat-label>
              <input matInput formControlName="tipo" placeholder="Ej: Archivo histórico" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Propiedad/Comodato</mat-label>
              <input matInput formControlName="propiedadComodato" placeholder="Ej: Propiedad del archivo" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Fecha de creación</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaDeCreacion" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Precisión</mat-label>
              <mat-select formControlName="precision">
                @for (opt of precisionOptions; track opt) {
                  <mat-option [value]="opt">{{ opt }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="fondoForm.invalid || store.isLoading()">
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
    .fondo-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 1rem; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem 0; }
      .form-actions { padding: 1.5rem 1rem; }
    }
  `],
})
export class FondoFormComponent implements OnInit {
  protected readonly store = inject(FondosStore);
  private readonly fondosService = inject(FondosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected fondoId: string | null = null;
  protected precisionOptions = PRECISION_OPTIONS;

  fondoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipo: [''],
    propiedadComodato: [''],
    fechaDeCreacion: [''],
    precision: [''],
  });

  constructor() {
    effect(() => {
      const fondo = this.store.selectedFondo();
      if (fondo && this.isEditMode) {
        this.loadFondoData(fondo);
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.fondoId = id;
        this.store.setInitialState();
        this.store.loadById(id);
        this.http.get(`${environment.apiUrl}/fondos/${id}`).subscribe({
          next: (fondo: any) => {
            this.loadFondoData(fondo);
          },
          error: (err) => console.error('[FondoForm] error al cargar', err),
        });
      }
    });
  }

  private loadFondoData(fondo: any) {
    this.fondoForm.patchValue({
      nombre: fondo.nombre || '',
      tipo: fondo.tipo || '',
      propiedadComodato: fondo.propiedadComodato || '',
      fechaDeCreacion: fondo.fechaDeCreacion ? new Date(fondo.fechaDeCreacion) : '',
      precision: fondo.precision || '',
    });
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.fondoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onSubmit() {
    if (this.fondoForm.invalid) return;

    const raw = this.fondoForm.value;
    const payload: any = {
      nombre: raw.nombre,
      tipo: raw.tipo || '',
      propiedadComodato: raw.propiedadComodato || '',
      fechaDeCreacion: raw.fechaDeCreacion instanceof Date
        ? raw.fechaDeCreacion.toISOString()
        : raw.fechaDeCreacion || '',
      precision: raw.precision || '',
    };

    if (this.isEditMode && this.fondoId) {
      this.fondosService.update(this.fondoId, payload).subscribe({
        next: () => this.router.navigate(['/fondos', this.fondoId]),
        error: (err) => {
          console.error('[FondoForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar el fondo');
        },
      });
    } else {
      this.fondosService.create(payload).subscribe({
        next: () => this.router.navigate(['/fondos']),
        error: (err) => {
          console.error('[FondoForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear el fondo');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/fondos']);
  }
}
