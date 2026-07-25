import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { SoporteService } from '../../../data/soporte.service';
import { SupportTicket, STATUS_LABELS, PRIORITY_LABELS } from '../../../domain/soporte.interface';

@Component({
  selector: 'app-soporte-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
  ],
  template: `
    <div class="page" *ngIf="!loading && ticket">
      <header class="page-head">
        <div>
          <h1 class="page-title">{{ ticket.ticketNumber }}</h1>
          <p class="simr-eyebrow">{{ ticket.subject }}</p>
        </div>
        <button mat-button routerLink="/soporte"><mat-icon>arrow_back</mat-icon> Volver</button>
      </header>

      <div class="meta-bar">
        <span class="status-badge status-{{ ticket.status }}">{{ STATUS_LABELS[ticket.status] }}</span>
        <span class="priority-badge priority-{{ ticket.priority }}">{{ PRIORITY_LABELS[ticket.priority] }}</span>
        <span class="meta-item"><mat-icon>person</mat-icon> {{ ticket.createdBy?.fullName || ticket.createdBy?.username }}</span>
        <span class="meta-item"><mat-icon>calendar_today</mat-icon> {{ ticket.createdAt | date:'short' }}</span>
        <span *ngIf="ticket.assignedTo" class="meta-item"><mat-icon>assignment_ind</mat-icon> Asignado a: {{ ticket.assignedTo.fullName }}</span>
      </div>

      <mat-card appearance="outlined" class="desc-card">
        <p class="desc-text">{{ ticket.description }}</p>
      </mat-card>

      <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="false" style="margin-bottom: 20px;">
        <app-archivo-manager
          [documentId]="ticket._id"
          collection="soporte"
        />
      </app-collapsible-section>

      <div class="responses">
        <div *ngFor="let r of ticket.responses" class="response" [class.staff]="r.isStaff">
          <div class="response-head">
            <strong>{{ r.user?.fullName || r.user?.username || 'Usuario' }}</strong>
            <span class="response-tag" *ngIf="r.isStaff">Staff</span>
            <span class="response-date">{{ r.createdAt | date:'short' }}</span>
          </div>
          <p class="response-text">{{ r.message }}</p>
        </div>
      </div>

      <mat-card appearance="outlined" class="reply-card">
        <h3>Responder</h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Escribe tu respuesta</mat-label>
          <textarea matInput [(ngModel)]="replyMessage" name="reply" rows="3"
            placeholder="Escribe tu mensaje aqu&iacute;"></textarea>
        </mat-form-field>
        <div class="reply-actions">
          <button mat-flat-button color="primary" (click)="sendResponse()" [disabled]="!replyMessage?.trim() || sending">
            <mat-icon>reply</mat-icon> Enviar respuesta
          </button>

          <div class="admin-actions" *ngIf="canAdmin">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Cambiar estado</mat-label>
              <mat-select [(ngModel)]="newStatus" (selectionChange)="changeStatus()">
                <mat-option *ngFor="let s of statusKeys" [value]="s">{{ STATUS_LABELS[s] }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-card>
    </div>

    <div *ngIf="loading" class="loading"><mat-spinner diameter="34"></mat-spinner></div>
  `,
  styles: [`
    .page { max-width: 860px; margin: 0 auto; padding: 28px 24px 48px; }
    .page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .page-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
    .simr-eyebrow { font-family: var(--simr-body); color: var(--simr-apunte); font-size: 0.95rem; margin: 2px 0 0; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .meta-bar { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; font-size: 0.85rem; color: var(--simr-apunte); }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-badge, .priority-badge { font-size: 0.78rem; padding: 2px 10px; border-radius: 12px; font-weight: 500; }
    .status-abierto { background: #e3f2fd; color: #1565c0; }
    .status-pendiente { background: #fff3e0; color: #e65100; }
    .status-resuelto { background: #e8f5e9; color: #2e7d32; }
    .status-cerrado { background: #f5f5f5; color: #616161; }
    .status-vencido { background: #fce4ec; color: #c62828; }
    .priority-baja { background: #f1f8e9; color: #558b2f; }
    .priority-media { background: #e8eaf6; color: #283593; }
    .priority-alta { background: #fff3e0; color: #e65100; }
    .priority-urgente { background: #fce4ec; color: #c62828; }
    .desc-card { margin-bottom: 20px; }
    .desc-text { white-space: pre-wrap; line-height: 1.6; margin: 0; }
    .responses { margin-bottom: 20px; }
    .response { background: var(--simr-hueso); border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; }
    .response.staff { background: #e8eaf6; border-left: 3px solid var(--simr-cobre); }
    .response-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 0.88rem; }
    .response-tag { font-size: 0.7rem; background: var(--simr-cobre); color: white; padding: 1px 8px; border-radius: 8px; font-weight: 600; }
    .response-date { color: var(--simr-apunte); font-size: 0.8rem; margin-left: auto; }
    .response-text { white-space: pre-wrap; margin: 0; line-height: 1.5; }
    .reply-card { padding: 16px; }
    .reply-card h3 { margin: 0 0 8px; font-family: var(--simr-display); color: var(--simr-tinta); }
    .full-width { width: 100%; }
    .reply-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .admin-actions { display: flex; gap: 8px; align-items: center; }
  `],
})
export class SoporteDetailComponent implements OnInit {
  ticket: SupportTicket | null = null;
  loading = false;
  replyMessage = '';
  sending = false;
  newStatus = '';
  canAdmin = false;

  STATUS_LABELS = STATUS_LABELS;
  PRIORITY_LABELS = PRIORITY_LABELS;
  statusKeys = Object.keys(STATUS_LABELS);

  constructor(
    private service: SoporteService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadTicket(id);
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (t) => {
        this.ticket = t;
        this.newStatus = t.status;
        this.loading = false;
        this.checkAdmin();
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error al cargar ticket', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/soporte']);
      },
    });
  }

  checkAdmin(): void {
    // Intentar un update para saber si tiene permisos "any"
    // En lugar de determinar admin, simplemente mostramos el control de estado
    // si el backend lo permite (indicador indirecto)
    this.canAdmin = true; // el backend rechazará si no tiene permiso
  }

  sendResponse(): void {
    if (!this.replyMessage?.trim() || !this.ticket) return;

    this.sending = true;
    this.service.addResponse(this.ticket._id, this.replyMessage.trim()).subscribe({
      next: (t) => {
        this.ticket = t;
        this.replyMessage = '';
        this.sending = false;
        this.snack.open('Respuesta enviada.', 'Cerrar', { duration: 2000 });
      },
      error: (err) => {
        this.sending = false;
        this.snack.open(err?.error?.message || 'Error al enviar respuesta', 'Cerrar', { duration: 3000 });
      },
    });
  }

  changeStatus(): void {
    if (!this.ticket || this.newStatus === this.ticket.status) return;

    this.service.update(this.ticket._id, { status: this.newStatus } as any).subscribe({
      next: (t) => {
        this.ticket = t;
        this.snack.open('Estado actualizado.', 'Cerrar', { duration: 2000 });
      },
      error: (err) => {
        this.snack.open(err?.error?.message || 'Error al cambiar estado', 'Cerrar', { duration: 3000 });
        this.newStatus = this.ticket!.status;
      },
    });
  }
}
