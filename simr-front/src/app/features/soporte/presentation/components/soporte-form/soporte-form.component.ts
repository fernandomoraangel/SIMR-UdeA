import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SoporteService } from '../../../data/soporte.service';
import { PRIORITY_LABELS } from '../../../domain/soporte.interface';

@Component({
  selector: 'app-soporte-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <h1 class="page-title">Nuevo ticket de soporte</h1>
        <button mat-button routerLink="/soporte"><mat-icon>arrow_back</mat-icon> Volver</button>
      </header>

      <mat-card appearance="outlined">
        <form (ngSubmit)="enviar()" class="form-grid" #f="ngForm">
          <mat-form-field appearance="outline">
            <mat-label>Asunto</mat-label>
            <input matInput [(ngModel)]="model.subject" name="subject" required
              placeholder="Resume tu solicitud en una línea" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descripción</mat-label>
            <textarea matInput [(ngModel)]="model.description" name="description" required
              placeholder="Describe tu solicitud con el mayor detalle posible"
              rows="6"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prioridad</mat-label>
            <mat-select [(ngModel)]="model.priority" name="priority">
              <mat-option *ngFor="let p of priorityKeys" [value]="p">{{ PRIORITY_LABELS[p] }}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="form-acciones">
            <button mat-flat-button color="primary" type="submit" [disabled]="sending || !f.form.valid">
              <mat-icon>send</mat-icon> Enviar solicitud
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 720px; margin: 0 auto; padding: 28px 24px 48px; }
    .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .page-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
    .form-acciones { margin-top: 12px; }
  `],
})
export class SoporteFormComponent {
  model = { subject: '', description: '', priority: 'media' };
  sending = false;

  PRIORITY_LABELS = PRIORITY_LABELS;
  priorityKeys = Object.keys(PRIORITY_LABELS);

  constructor(
    private service: SoporteService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  enviar(): void {
    if (!this.model.subject?.trim() || !this.model.description?.trim()) return;

    this.sending = true;
    this.service.create({
      subject: this.model.subject.trim(),
      description: this.model.description.trim(),
      priority: this.model.priority,
    }).subscribe({
      next: (ticket) => {
        this.snack.open('Ticket creado exitosamente.', 'Cerrar', { duration: 2500 });
        this.router.navigate(['/soporte', ticket._id]);
      },
      error: (err) => {
        this.sending = false;
        this.snack.open(err?.error?.message || 'Error al crear ticket', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
