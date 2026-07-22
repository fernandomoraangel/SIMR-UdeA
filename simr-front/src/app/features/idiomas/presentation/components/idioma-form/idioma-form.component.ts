import { Component, OnInit, inject } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IdiomasStore } from '../../../state/idiomas.store';
import { IdiomasService } from '../../../data/idiomas.service';

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
    MatProgressBarModule,
    MatTooltipModule,
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

      <mat-card class="idioma-form" appearance="outlined">
        <form [formGroup]="idiomaForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <div class="field-with-help">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Idioma *</mat-label>
                <input matInput formControlName="idioma" placeholder="Ej: Español, Inglés, Francés…" />
                @if (isFieldInvalid('idioma')) {
                  <mat-error>El idioma es obligatorio</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="idiomaForm.invalid || store.isLoading()">
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
    .idioma-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .field-with-help { display: flex; align-items: flex-start; gap: 0.25rem; }
    .field-with-help .campo { flex: 1; }
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
export class IdiomaFormComponent implements OnInit {
  protected readonly store = inject(IdiomasStore);
  private readonly idiomasService = inject(IdiomasService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected isEditMode = false;
  protected idiomaId: string | null = null;

  idiomaForm: FormGroup = this.fb.group({
    idioma: ['', Validators.required],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.idiomaId = id;
        this.store.setInitialState();
        this.store.loadIdiomaById(id);
      }
    });
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.idiomaForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onSubmit() {
    if (this.idiomaForm.invalid) return;

    const payload = { idioma: this.idiomaForm.value.idioma };

    if (this.isEditMode && this.idiomaId) {
      this.idiomasService.update(this.idiomaId, payload).subscribe({
        next: () => this.router.navigate(['/idiomas', this.idiomaId]),
        error: (err) => {
          this.store.setError(err?.error?.message || 'Error al actualizar el idioma');
        },
      });
    } else {
      this.idiomasService.create(payload).subscribe({
        next: () => this.router.navigate(['/idiomas']),
        error: (err) => {
          this.store.setError(err?.error?.message || 'Error al crear el idioma');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/idiomas']);
  }
}
