import { Component, OnInit, effect, inject } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IdiomasStore } from '../../../state/idiomas.store';

@Component({
  selector: 'app-idioma-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Idioma' : 'Nuevo Idioma' }}</h1>
      </header>

      @if (store.hasError()) {
      <div class="alerta">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
        <button mat-button (click)="store.clearError()">Cerrar</button>
      </div>
      }

      <mat-card class="idioma-form" appearance="outlined">
        <form [formGroup]="idiomaForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="campo">
            <mat-label>Nombre del Idioma</mat-label>
            <input
              matInput
              id="idioma"
              formControlName="idioma"
              placeholder="Ej: Español, Inglés, Francés..."
            />
            @if (isFieldInvalid('idioma')) {
            <mat-error>
              @if (idiomaForm.get('idioma')?.errors?.['required']) { El nombre del
              idioma es requerido } @if
              (idiomaForm.get('idioma')?.errors?.['minlength']) { El nombre debe
              tener al menos 2 caracteres }
            </mat-error>
            }
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()" [disabled]="store.isLoading()">
              Cancelar
            </button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="idiomaForm.invalid || store.isLoading()"
            >
              @if (store.isLoading()) {
              <mat-spinner diameter="18"></mat-spinner>
              Guardando... } @else {
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
              }
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .form-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 2rem;
      }
      .form-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .form-header h1 {
        margin: 0;
      }
      .idioma-form {
        padding: 2rem;
        border-radius: 14px !important;
        border-color: var(--mat-sys-outline) !important;
      }
      .campo {
        width: 100%;
      }
      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }
      .alerta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #fbeae6;
        color: var(--simr-sello-osc);
        border: 1px solid var(--simr-sello);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
      }
    `,
  ],
})
export class IdiomaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(IdiomasStore);

  idiomaForm: FormGroup;
  isEditMode = false;
  idiomaId: string | null = null;

  constructor() {
    this.idiomaForm = this.fb.group({
      idioma: ['', [Validators.required, Validators.minLength(2)]],
    });

    effect(() => {
      const idioma = this.store.selectedIdioma();
      if (idioma) {
        this.idiomaForm.patchValue({ idioma: idioma.idioma });
      }
    });
  }

  ngOnInit() {
    this.store.setInitialState();
    this.idiomaId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.idiomaId;

    if (this.isEditMode && this.idiomaId) {
      this.store.loadIdiomaById(this.idiomaId);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.idiomaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.idiomaForm.valid) {
      const formValue = this.idiomaForm.value;
      if (this.isEditMode && this.idiomaId) {
        this.store.updateIdioma({ id: this.idiomaId, data: formValue });
      } else {
        this.store.createIdioma(formValue);
      }
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/idiomas']);
  }
}
