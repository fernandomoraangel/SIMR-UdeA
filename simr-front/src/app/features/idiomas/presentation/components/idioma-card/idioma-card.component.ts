import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Idioma } from '../../../domain/idioma.interface';

@Component({
  selector: 'app-idioma-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card class="idioma-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ idioma.idioma }}</mat-card-title>
        <div class="card-actions">
          <button mat-icon-button (click)="onView.emit(idioma._id)" title="Ver detalles" aria-label="Ver detalles">
            <mat-icon>visibility</mat-icon>
          </button>
          <button mat-icon-button (click)="onEdit.emit(idioma._id)" title="Editar" aria-label="Editar">
            <mat-icon>edit</mat-icon>
          </button>
          <button
            mat-icon-button
            color="warn"
            (click)="onDelete.emit(idioma._id)"
            title="Eliminar"
            aria-label="Eliminar"
          >
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="meta">
          <span class="meta-item">
            <mat-icon>person</mat-icon>
            <span>{{ idioma.creador.fullName }}</span>
          </span>
          <span class="meta-item">
            <mat-icon>event</mat-icon>
            <span>{{ idioma.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .idioma-card {
        border-radius: 14px !important;
        border-color: var(--mat-sys-outline) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .idioma-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 22px rgba(31, 42, 36, 0.14) !important;
      }
      mat-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      mat-card-title {
        font-family: var(--simr-display);
        font-weight: 600;
        font-size: 1.2rem;
        color: var(--simr-tinta);
      }
      .card-actions {
        display: flex;
        gap: 2px;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--simr-tinta-2);
      }
      .meta-item mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--simr-musgo);
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
