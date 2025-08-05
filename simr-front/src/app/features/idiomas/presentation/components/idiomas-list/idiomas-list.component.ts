// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { IdiomasStore } from '../../../state/idiomas.store';
// import { IdiomaCardComponent } from '../../components/idioma-card/idioma-card.component';

// @Component({
//   selector: 'app-idiomas-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, IdiomaCardComponent],
//   providers: [IdiomasStore],
//   template: `
//     <div class="idiomas-list-container">
//       <div class="header">
//         <h1>Gestión de Idiomas</h1>
//         <a routerLink="create" class="btn btn-primary">
//           <i class="fas fa-plus"></i>
//           Nuevo Idioma
//         </a>
//       </div>

//       @if (store.isLoading()) {
//       <div class="loading">
//         <i class="fas fa-spinner fa-spin"></i>
//         Cargando idiomas...
//       </div>
//       } @if (store.hasError()) {
//       <div class="error-message">
//         <i class="fas fa-exclamation-triangle"></i>
//         {{ store.error() }}
//         <button (click)="store.clearError()" class="btn-close">×</button>
//       </div>
//       } @if (store.hasIdiomas() && !store.isLoading()) {
//       <div class="stats">
//         <p>
//           Total de idiomas: <strong>{{ store.idiomasCount() }}</strong>
//         </p>
//       </div>

//       <div class="idiomas-grid">
//         @for (idioma of store.idiomas(); track idioma._id) {
//         <app-idioma-card
//           [idioma]="idioma"
//           (onEdit)="navigateToEdit($event)"
//           (onDelete)="confirmDelete($event)"
//           (onView)="navigateToDetail($event)"
//         >
//         </app-idioma-card>
//         }
//       </div>
//       } @if (!store.hasIdiomas() && !store.isLoading()) {
//       <div class="empty-state">
//         <i class="fas fa-language fa-3x"></i>
//         <h3>No hay idiomas registrados</h3>
//         <p>Comienza agregando tu primer idioma</p>
//         <a routerLink="create" class="btn btn-primary">Agregar Idioma</a>
//       </div>
//       }
//     </div>
//   `,
//   styles: [
//     `
//       .idiomas-list-container {
//         padding: 2rem;
//         max-width: 1200px;
//         margin: 0 auto;
//       }

//       .header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 2rem;
//       }

//       .stats {
//         margin-bottom: 1.5rem;
//         padding: 1rem;
//         background: #f8f9fa;
//         border-radius: 8px;
//       }

//       .idiomas-grid {
//         display: grid;
//         grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//         gap: 1.5rem;
//       }

//       .loading {
//         text-align: center;
//         padding: 3rem;
//         color: #6c757d;
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

//       .empty-state {
//         text-align: center;
//         padding: 4rem 2rem;
//         color: #6c757d;
//       }

//       .empty-state i {
//         color: #dee2e6;
//         margin-bottom: 1rem;
//       }

//       .btn {
//         padding: 0.75rem 1.5rem;
//         border: none;
//         border-radius: 8px;
//         text-decoration: none;
//         display: inline-flex;
//         align-items: center;
//         gap: 0.5rem;
//         cursor: pointer;
//         transition: all 0.2s;
//       }

//       .btn-primary {
//         background: #007bff;
//         color: white;
//       }

//       .btn-primary:hover {
//         background: #0056b3;
//       }
//     `,
//   ],
// })
// export class IdiomasListComponent implements OnInit {
//   protected readonly store = inject(IdiomasStore);

//   ngOnInit() {
//     this.store.loadIdiomas();
//   }

//   navigateToEdit(id: string) {
//     // Router navigation será manejada por el componente padre o servicio de navegación
//     console.log('Navigate to edit:', id);
//   }

//   navigateToDetail(id: string) {
//     console.log('Navigate to detail:', id);
//   }

//   confirmDelete(id: string) {
//     if (confirm('¿Estás seguro de que deseas eliminar este idioma?')) {
//       this.store.deleteIdioma(id);
//     }
//   }
// }
