import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IdiomasStore } from '../../../state/idiomas.store';

@Component({
  selector: 'app-idioma-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedIdioma(); as idioma) {
        <div class="header-actions">
          <button mat-stroked-button (click)="navigateToEdit(idioma._id)">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
          <button mat-stroked-button color="warn" (click)="confirmDelete(idioma._id)">
            <mat-icon>delete</mat-icon>
            Eliminar
          </button>
        </div>
        }
      </header>

      @if (store.isLoading()) {
      <div class="cargando">
        <mat-spinner diameter="36"></mat-spinner>
        <span>Cargando detalles del idioma…</span>
      </div>
      } @if (store.hasError()) {
      <div class="alerta">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
        <button mat-button (click)="store.clearError()">Cerrar</button>
      </div>
      } @if (store.selectedIdioma(); as idioma) {
      <mat-card class="ficha" appearance="outlined">
        <div class="ficha-cabecera">
          <div class="titulo">
            <mat-icon>translate</mat-icon>
            <h1>{{ idioma.idioma }}</h1>
          </div>
          <span class="simr-codigo">ID {{ idioma._id }}</span>
        </div>

        <section class="seccion">
          <h3><mat-icon>person</mat-icon> Información del Creador</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre completo</label>
              <span>{{ idioma.creador.fullName }}</span>
            </div>
            <div class="info-item">
              <label>ID del creador</label>
              <span class="simr-codigo">{{ idioma.creador._id }}</span>
            </div>
          </div>
        </section>

        <section class="seccion">
          <h3><mat-icon>schedule</mat-icon> Información de Fechas</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Fecha de creación</label>
              <span>{{ idioma.creado | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
            <div class="info-item">
              <label>Hace</label>
              <span>{{ getTimeAgo(idioma.creado) }}</span>
            </div>
          </div>
        </section>

        <section class="seccion">
          <h3><mat-icon>insights</mat-icon> Estadísticas</h3>
          <div class="stats-grid">
            <mat-card class="stat" appearance="outlined">
              <div class="stat-value">{{ idioma.idioma.length }}</div>
              <div class="stat-label">Caracteres</div>
            </mat-card>
            <mat-card class="stat" appearance="outlined">
              <div class="stat-value">{{ idioma.idioma.split(' ').length }}</div>
              <div class="stat-label">Palabras</div>
            </mat-card>
          </div>
        </section>
      </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .detail-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 2rem;
      }
      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .header-actions {
        display: flex;
        gap: 0.75rem;
      }
      .ficha {
        border-radius: 14px !important;
        border-color: var(--mat-sys-outline) !important;
        overflow: hidden;
      }
      .ficha-cabecera {
        background: var(--simr-tinta);
        color: var(--simr-hueso);
        padding: 1.75rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .titulo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .titulo mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--simr-cobre);
      }
      .titulo h1 {
        margin: 0;
        font-family: var(--simr-display);
        font-weight: 600;
        font-size: 2.2rem;
        color: var(--simr-hueso);
      }
      .ficha-cabecera .simr-codigo {
        color: rgba(251, 249, 244, 0.7);
      }
      .seccion {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--mat-sys-outline);
      }
      .seccion:last-child {
        border-bottom: none;
      }
      .seccion h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem;
        font-family: var(--simr-body);
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--simr-sello);
      }
      .seccion h3 mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--simr-sello);
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      .info-item {
        background: var(--simr-papel);
        padding: 1rem 1.25rem;
        border-radius: 10px;
        border-left: 3px solid var(--simr-cobre);
      }
      .info-item label {
        display: block;
        font-weight: 600;
        color: var(--simr-tinta-2);
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
      }
      .info-item span {
        color: var(--simr-tinta);
        font-size: 1rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      .stat {
        text-align: center;
        border-radius: 12px !important;
        border-color: var(--mat-sys-outline) !important;
      }
      .stat-value {
        font-family: var(--simr-display);
        font-size: 2rem;
        font-weight: 600;
        color: var(--simr-sello);
        margin: 0.5rem 0 0.25rem;
      }
      .stat-label {
        color: var(--simr-tinta-2);
        font-size: 0.85rem;
      }
      .cargando {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        padding: 3rem;
        color: var(--simr-tinta-2);
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
export class IdiomaDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(IdiomasStore);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadIdiomaById(id);
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 30) return `Hace ${diffInDays} días`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/idiomas/edit', id]);
  }

  confirmDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este idioma?')) {
      this.store.deleteIdioma(id);
      setTimeout(() => {
        if (!this.store.hasError()) {
          this.goBack();
        }
      }, 1000);
    }
  }

  goBack() {
    this.router.navigate(['/idiomas']);
  }
}
