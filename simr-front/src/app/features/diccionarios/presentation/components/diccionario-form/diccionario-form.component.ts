import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '@env/environment';
import { DiccionariosStore } from '../../../state/diccionarios.store';
import { DiccionariosService } from '../../../data/diccionarios.service';

@Component({
  selector: 'app-diccionario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  providers: [DiccionariosStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Entrada' : 'Nueva Entrada' }}</h1>
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

      <mat-card class="diccionario-form" appearance="outlined">
        <form [formGroup]="diccionarioForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <div class="form-row">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Tabla</mat-label>
                <input matInput formControlName="tabla" placeholder="Ej: medios" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Campo</mat-label>
                <input matInput formControlName="campo" placeholder="Ej: nombre" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Nombre largo</mat-label>
              <input matInput formControlName="campoLargo" placeholder="Ej: Nombre del medio sonoro" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Definición</mat-label>
              <textarea matInput formControlName="definicion" rows="4" placeholder="Definición del campo..."></textarea>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="store.isLoading()">
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
    .diccionario-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .form-row { display: flex; gap: 0.75rem; }
    .form-row .campo { flex: 1; }
    .campo { min-width: 0; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-section { padding: 1.5rem 1rem; }
      .form-actions { padding: 1.5rem 1rem; }
      .form-row { flex-direction: column; }
    }
  `],
})
export class DiccionarioFormComponent implements OnInit {
  protected readonly store = inject(DiccionariosStore);
  private readonly diccionariosService = inject(DiccionariosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected diccionarioId: string | null = null;

  diccionarioForm: FormGroup = this.fb.group({
    tabla: [''],
    campo: [''],
    campoLargo: [''],
    definicion: [''],
  });

  constructor() {
    effect(() => {
      const item = this.store.selectedDiccionario();
      if (item && this.isEditMode) {
        this.diccionarioForm.patchValue({
          tabla: item.tabla || '',
          campo: item.campo || '',
          campoLargo: item.campoLargo || '',
          definicion: item.definicion || '',
        });
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.diccionarioId = id;
        this.store.setInitialState();
        this.store.loadDiccionarioById(id);
        this.http.get(`${environment.apiUrl}/diccionarios/${id}`).subscribe({
          next: (item: any) => {
            this.diccionarioForm.patchValue({
              tabla: item.tabla || '',
              campo: item.campo || '',
              campoLargo: item.campoLargo || '',
              definicion: item.definicion || '',
            });
          },
          error: (err) => console.error('[DiccionarioForm] error al cargar', err),
        });
      }
    });
  }

  protected onSubmit() {
    const payload = {
      tabla: this.diccionarioForm.value.tabla,
      campo: this.diccionarioForm.value.campo,
      campoLargo: this.diccionarioForm.value.campoLargo,
      definicion: this.diccionarioForm.value.definicion,
    };

    if (this.isEditMode && this.diccionarioId) {
      this.diccionariosService.update(this.diccionarioId, payload).subscribe({
        next: () => this.router.navigate(['/diccionarios', this.diccionarioId]),
        error: (err) => {
          console.error('[DiccionarioForm] Error al actualizar:', err);
          this.store.setError(err?.error?.message || 'Error al actualizar la entrada');
        },
      });
    } else {
      this.diccionariosService.create(payload).subscribe({
        next: () => this.router.navigate(['/diccionarios']),
        error: (err) => {
          console.error('[DiccionarioForm] Error al crear:', err);
          this.store.setError(err?.error?.message || 'Error al crear la entrada');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/diccionarios']);
  }
}
