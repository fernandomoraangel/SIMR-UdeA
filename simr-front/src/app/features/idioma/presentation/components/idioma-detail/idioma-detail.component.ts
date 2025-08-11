// src/app/features/idiomas/pages/idioma-detail/idioma-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IdiomasStore } from '../../../state/idiomas.store';

@Component({
  selector: 'app-idioma-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [IdiomasStore],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <button (click)="goBack()" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>

        @if (store.selectedIdioma(); as idioma) {
        <div class="header-actions">
          <button (click)="navigateToEdit(idioma._id)" class="btn btn-primary">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button (click)="confirmDelete(idioma._id)" class="btn btn-danger">
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
        </div>
        }
      </div>

      @if (store.isLoading()) {
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Cargando detalles del idioma...
      </div>
      } @if (store.hasError()) {
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        {{ store.error() }}
        <button (click)="store.clearError()" class="btn-close">×</button>
      </div>
      } @if (store.selectedIdioma(); as idioma) {
      <div class="detail-card">
        <div class="card-header">
          <div class="idioma-title">
            <i class="fas fa-language"></i>
            <h1>{{ idioma.idioma }}</h1>
          </div>
          <div class="idioma-id">
            <small>ID: {{ idioma._id }}</small>
          </div>
        </div>

        <div class="card-body">
          <div class="detail-section">
            <h3><i class="fas fa-user"></i> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo:</label>
                <span>{{ idioma.creador.fullName }}</span>
              </div>
              <div class="info-item">
                <label>ID del creador:</label>
                <span>{{ idioma.creador._id }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3><i class="fas fa-clock"></i> Información de Fechas</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Fecha de creación:</label>
                <span>{{ idioma.creado | date : 'dd/MM/yyyy HH:mm:ss' }}</span>
              </div>
              <div class="info-item">
                <label>Hace:</label>
                <span>{{ getTimeAgo(idioma.creado) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Estadísticas</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ idioma.idioma.length }}</div>
                <div class="stat-label">Caracteres</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">
                  {{ idioma.idioma.split(' ').length }}
                </div>
                <div class="stat-label">Palabras</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        margin-bottom: 2rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .detail-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .card-header {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        padding: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .idioma-title {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .idioma-title i {
        font-size: 2rem;
      }

      .idioma-title h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
      }

      .idioma-id {
        opacity: 0.8;
      }

      .card-body {
        padding: 2rem;
      }

      .detail-section {
        margin-bottom: 2rem;
      }

      .detail-section:last-child {
        margin-bottom: 0;
      }

      .detail-section h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: #495057;
        font-size: 1.25rem;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .info-item {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }

      .info-item label {
        display: block;
        font-weight: 600;
        color: #6c757d;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .info-item span {
        color: #212529;
        font-size: 1rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        border: 2px solid #e9ecef;
        transition: transform 0.2s;
      }

      .stat-card:hover {
        transform: translateY(-2px);
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #007bff;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        color: #6c757d;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .loading {
        text-align: center;
        padding: 3rem;
        color: #6c757d;
      }

      .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #721c24;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
      }

      .btn-outline {
        background: white;
        border: 1px solid #dee2e6;
        color: #6c757d;
      }

      .btn-outline:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background: #c82333;
      }
    `,
  ],
})
export class IdiomaDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(IdiomasStore);

  ngOnInit() {
    console.log('IdiomaDetailComponent initialized');
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
      // Navigate back to list after deletion
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
