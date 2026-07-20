import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IdiomasStore } from '../../../state/idiomas.store';
import { IdiomaCardComponent } from '../idioma-card/idioma-card.component';

@Component({
  selector: 'app-idiomas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    IdiomaCardComponent,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="idiomas-list-container">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Catálogo · Términos</p>
          <h1>Gestión de Idiomas</h1>
        </div>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Nuevo Idioma
        </a>
      </header>

      @if (store.isLoading()) {
      <mat-progress-bar mode="indeterminate" class="barra"></mat-progress-bar>
      }

      @if (store.hasError()) {
      <div class="alerta">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
        <button mat-button (click)="store.clearError()">Cerrar</button>
      </div>
      }

      @if (store.hasIdiomas() && !store.isLoading()) {
      <p class="simr-codigo">Total de idiomas: {{ store.idiomasCount() }}</p>
      <div class="idiomas-grid">
        @for (idioma of store.idiomas(); track idioma._id) {
        <app-idioma-card
          [idioma]="idioma"
          (onEdit)="navigateToEdit($event)"
          (onDelete)="confirmDelete($event)"
          (onView)="navigateToDetail($event)"
        >
        </app-idioma-card>
        }
      </div>
      }

      @if (!store.hasIdiomas() && !store.isLoading()) {
      <div class="vacio">
        <mat-icon>graphic_eq</mat-icon>
        <h3>No hay idiomas registrados</h3>
        <p>Aún no se ha catalogado ningún idioma en el archivo.</p>
        <a mat-raised-button color="primary" routerLink="create">
          <mat-icon>add</mat-icon>
          Agregar Idioma
        </a>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .idiomas-list-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1.5rem;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .header h1 {
        margin: 0.2em 0 0;
      }
      .barra {
        margin-bottom: 1rem;
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
        margin-bottom: 1rem;
      }
      .idiomas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .vacio {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--simr-tinta-2);
      }
      .vacio mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: var(--simr-cobre);
        opacity: 0.7;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class IdiomasListComponent implements OnInit {
  protected readonly store = inject(IdiomasStore);
  private readonly router: Router = inject(Router);

  ngOnInit() {
    this.store.setInitialState();
    this.store.loadIdiomas();
    this.store.clearSuccess();
  }

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/idiomas/edit', id]);
  }

  navigateToDetail(id: string) {
    this.store.setInitialState();
    this.router.navigate(['idiomas', id]);
  }

  confirmDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este idioma?')) {
      this.store.deleteIdioma(id);
    }
  }
}
