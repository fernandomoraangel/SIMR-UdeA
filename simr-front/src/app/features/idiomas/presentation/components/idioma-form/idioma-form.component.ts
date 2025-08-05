// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   Validators,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { IdiomasStore } from '../../../state/idiomas.store';

// @Component({
//   selector: 'app-idioma-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   providers: [IdiomasStore],
//   template: `
//     <div class="form-container">
//       <div class="form-header">
//         <h1>{{ isEditMode ? 'Editar Idioma' : 'Nuevo Idioma' }}</h1>
//         <button (click)="goBack()" class="btn btn-outline">
//           <i class="fas fa-arrow-left"></i>
//           Volver
//         </button>
//       </div>

//       @if (store.hasError()) {
//       <div class="error-message">
//         <i class="fas fa-exclamation-triangle"></i>
//         {{ store.error() }}
//         <button (click)="store.clearError()" class="btn-close">×</button>
//       </div>
//       }

//       <form
//         [formGroup]="idiomaForm"
//         (ngSubmit)="onSubmit()"
//         class="idioma-form"
//       >
//         <div class="form-group">
//           <label for="idioma">Nombre del Idioma *</label>
//           <input
//             id="idioma"
//             type="text"
//             formControlName="idioma"
//             class="form-control"
//             [class.is-invalid]="isFieldInvalid('idioma')"
//             placeholder="Ej: Español, Inglés, Francés..."
//           />
//           @if (isFieldInvalid('idioma')) {
//           <div class="invalid-feedback">
//             @if (idiomaForm.get('idioma')?.errors?.['required']) { El nombre del
//             idioma es requerido } @if
//             (idiomaForm.get('idioma')?.errors?.['minlength']) { El nombre debe
//             tener al menos 2 caracteres }
//           </div>
//           }
//         </div>

//         <div class="form-actions">
//           <button
//             type="button"
//             (click)="goBack()"
//             class="btn btn-outline"
//             [disabled]="store.isLoading()"
//           >
//             Cancelar
//           </button>
//           <button
//             type="submit"
//             class="btn btn-primary"
//             [disabled]="idiomaForm.invalid || store.isLoading()"
//           >
//             @if (store.isLoading()) {
//             <i class="fas fa-spinner fa-spin"></i>
//             Guardando... } @else {
//             <i class="fas fa-save"></i>
//             {{ isEditMode ? 'Actualizar' : 'Crear' }}
//             }
//           </button>
//         </div>
//       </form>
//     </div>
//   `,
//   styles: [
//     `
//       .form-container {
//         max-width: 600px;
//         margin: 2rem auto;
//         padding: 0 2rem;
//       }

//       .form-header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 2rem;
//       }

//       .idioma-form {
//         background: white;
//         padding: 2rem;
//         border-radius: 12px;
//         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//       }

//       .form-group {
//         margin-bottom: 1.5rem;
//       }

//       .form-group label {
//         display: block;
//         margin-bottom: 0.5rem;
//         font-weight: 500;
//         color: #212529;
//       }

//       .form-control {
//         width: 100%;
//         padding: 0.75rem;
//         border: 1px solid #dee2e6;
//         border-radius: 8px;
//         font-size: 1rem;
//         transition: border-color 0.2s, box-shadow 0.2s;
//       }

//       .form-control:focus {
//         outline: none;
//         border-color: #007bff;
//         box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
//       }

//       .form-control.is-invalid {
//         border-color: #dc3545;
//       }

//       .invalid-feedback {
//         display: block;
//         color: #dc3545;
//         font-size: 0.875rem;
//         margin-top: 0.25rem;
//       }

//       .form-actions {
//         display: flex;
//         gap: 1rem;
//         justify-content: flex-end;
//         margin-top: 2rem;
//       }

//       .btn {
//         padding: 0.75rem 1.5rem;
//         border: none;
//         border-radius: 8px;
//         cursor: pointer;
//         display: inline-flex;
//         align-items: center;
//         gap: 0.5rem;
//         font-weight: 500;
//         transition: all 0.2s;
//       }

//       .btn:disabled {
//         opacity: 0.6;
//         cursor: not-allowed;
//       }

//       .btn-primary {
//         background: #007bff;
//         color: white;
//       }

//       .btn-primary:hover:not(:disabled) {
//         background: #0056b3;
//       }

//       .btn-outline {
//         background: white;
//         border: 1px solid #dee2e6;
//         color: #6c757d;
//       }

//       .btn-outline:hover:not(:disabled) {
//         background: #f8f9fa;
//         border-color: #adb5bd;
//       }

//       .error-message {
//         background: #f8d7da;
//         color: #721c24;
//         padding: 1rem;
//         border-radius: 8px;
//         margin-bottom: 1rem;
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//       }

//       .btn-close {
//         background: none;
//         border: none;
//         font-size: 1.5rem;
//         cursor: pointer;
//         color: #721c24;
//       }
//     `,
//   ],
// })
// export class IdiomaFormComponent implements OnInit {
//   private readonly fb = inject(FormBuilder);
//   private readonly router = inject(Router);
//   private readonly route = inject(ActivatedRoute);
//   protected readonly store = inject(IdiomasStore);

//   idiomaForm: FormGroup;
//   isEditMode = false;
//   idiomaId: string | null = null;

//   constructor() {
//     this.idiomaForm = this.fb.group({
//       idioma: ['', [Validators.required, Validators.minLength(2)]],
//     });
//   }

//   ngOnInit() {
//     this.idiomaId = this.route.snapshot.paramMap.get('id');
//     this.isEditMode = !!this.idiomaId;

//     if (this.isEditMode && this.idiomaId) {
//       this.store.loadIdiomaById(this.idiomaId);
//       // Subscribe to selected idioma changes
//       this.store.selectedIdioma.subscribe((idioma) => {
//         if (idioma) {
//           this.idiomaForm.patchValue({
//             idioma: idioma.idioma,
//           });
//         }
//       });
//     }
//   }

//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.idiomaForm.get(fieldName);
//     return !!(field && field.invalid && (field.dirty || field.touched));
//   }

//   onSubmit() {
//     if (this.idiomaForm.valid) {
//       const formValue = this.idiomaForm.value;

//       if (this.isEditMode && this.idiomaId) {
//         this.store.updateIdioma({ id: this.idiomaId, data: formValue });
//       } else {
//         this.store.createIdioma(formValue);
//       }

//       // Navigate back after successful operation
//       // Note: In a real app, you'd want to listen for success/error states
//       setTimeout(() => {
//         if (!this.store.hasError()) {
//           this.goBack();
//         }
//       }, 1000);
//     }
//   }

//   goBack() {
//     this.router.navigate(['/idiomas']);
//   }
// }
