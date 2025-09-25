import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Idioma } from '../../../domain/idioma.interface';

@Component({
  selector: 'app-idioma-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="idioma-card">
      <div class="card-header">
        <h3>{{ idioma.idioma }}</h3>
        <div class="card-actions">
          <button
            (click)="onView.emit(idioma._id)"
            class="btn btn-outline btn-sm"
            title="Ver detalles"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button
            (click)="onEdit.emit(idioma._id)"
            class="btn btn-outline btn-sm"
            title="Editar"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            (click)="onDelete.emit(idioma._id)"
            class="btn btn-danger btn-sm"
            title="Eliminar"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="creator-info">
          <i class="fas fa-user"></i>
          <span>{{ idioma.creador.fullName }}</span>
        </div>

        <div class="date-info">
          <i class="fas fa-calendar"></i>
          <span>{{ idioma.creado | date : 'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .idioma-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        overflow: hidden;
      }

      .idioma-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5rem 1.5rem 1rem;
        border-bottom: 1px solid #e9ecef;
      }

      .card-header h3 {
        margin: 0;
        color: #212529;
        font-weight: 600;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
      }

      .card-body {
        padding: 1.5rem;
      }

      .creator-info,
      .date-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        color: #6c757d;
        font-size: 0.9rem;
      }

      .creator-info:last-child,
      .date-info:last-child {
        margin-bottom: 0;
      }

      .btn {
        padding: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      }

      .btn-outline:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
      }

      .btn-danger {
        border-color: #dc3545;
        color: #dc3545;
      }

      .btn-danger:hover {
        background: #dc3545;
        color: white;
      }

      .btn-sm {
        font-size: 0.8rem;
      }
    `,
  ],
})
export class IdiomaCardComponent {
  @Input({ required: true }) idioma!: Idioma;
  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onView = new EventEmitter<string>();
}
