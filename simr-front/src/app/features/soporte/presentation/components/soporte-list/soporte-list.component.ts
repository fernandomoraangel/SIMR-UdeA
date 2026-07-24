import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SoporteService } from '../../../data/soporte.service';
import { SupportTicket, STATUS_LABELS, PRIORITY_LABELS } from '../../../domain/soporte.interface';

@Component({
  selector: 'app-soporte-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatChipsModule, MatProgressSpinnerModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1 class="page-title">Soporte T&eacute;cnico</h1>
          <p class="simr-eyebrow">Tickets de soporte y solicitudes de ayuda</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/soporte/crear">
          <mat-icon>add</mat-icon> Nuevo ticket
        </button>
      </header>

      <mat-card appearance="outlined" class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" (input)="applyFilters()" placeholder="Asunto, descripción, nro. ticket" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="filterStatus" (selectionChange)="applyFilters()">
              <mat-option value="">Todos</mat-option>
              <mat-option *ngFor="let s of statusKeys" [value]="s">{{ STATUS_LABELS[s] }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Prioridad</mat-label>
            <mat-select [(ngModel)]="filterPriority" (selectionChange)="applyFilters()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let p of priorityKeys" [value]="p">{{ PRIORITY_LABELS[p] }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <div *ngIf="loading" class="loading"><mat-spinner diameter="34"></mat-spinner></div>

      <mat-card appearance="outlined" *ngIf="!loading">
        <table mat-table [dataSource]="tickets" class="tkt-table">
          <ng-container matColumnDef="ticketNumber">
            <th mat-header-cell *matHeaderCellDef>Ticket</th>
            <td mat-cell *matCellDef="let t">
              <a [routerLink]="['/soporte', t._id]" class="tkt-link">{{ t.ticketNumber }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="subject">
            <th mat-header-cell *matHeaderCellDef>Asunto</th>
            <td mat-cell *matCellDef="let t">
              <a [routerLink]="['/soporte', t._id]" class="tkt-link">{{ t.subject }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let t">
              <span class="status-badge status-{{ t.status }}">{{ STATUS_LABELS[t.status] }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Prioridad</th>
            <td mat-cell *matCellDef="let t">
              <span class="priority-badge priority-{{ t.priority }}">{{ PRIORITY_LABELS[t.priority] }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="respuestas">
            <th mat-header-cell *matHeaderCellDef>Resp.</th>
            <td mat-cell *matCellDef="let t">{{ t.responses?.length || 0 }}</td>
          </ng-container>
          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef>Actualizado</th>
            <td mat-cell *matCellDef="let t">{{ t.updatedAt | date:'short' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="tkt-row"
            [routerLink]="['/soporte', row._id]"></tr>
        </table>

        <div *ngIf="!tickets.length && !loading" class="empty">
          <mat-icon>inbox</mat-icon>
          <p>No hay tickets de soporte.</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; padding: 28px 24px 48px; }
    .page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .page-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
    .simr-eyebrow { font-family: var(--simr-body); color: var(--simr-apunte); font-size: 0.88rem; margin: 4px 0 0; }
    .filters-card { margin-bottom: 16px; }
    .filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; padding: 8px; }
    .filters mat-form-field { min-width: 180px; flex: 1; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .empty { text-align: center; padding: 40px; color: var(--simr-apunte); }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .tkt-table { width: 100%; }
    .tkt-row { cursor: pointer; }
    .tkt-row:hover { background: var(--simr-hueso); }
    .tkt-link { color: var(--simr-cobre); text-decoration: none; font-weight: 500; }
    .tkt-link:hover { text-decoration: underline; }
    .status-badge, .priority-badge { font-size: 0.78rem; padding: 2px 10px; border-radius: 12px; font-weight: 500; display: inline-block; }
    .status-abierto { background: #e3f2fd; color: #1565c0; }
    .status-pendiente { background: #fff3e0; color: #e65100; }
    .status-resuelto { background: #e8f5e9; color: #2e7d32; }
    .status-cerrado { background: #f5f5f5; color: #616161; }
    .status-vencido { background: #fce4ec; color: #c62828; }
    .priority-baja { background: #f1f8e9; color: #558b2f; }
    .priority-media { background: #e8eaf6; color: #283593; }
    .priority-alta { background: #fff3e0; color: #e65100; }
    .priority-urgente { background: #fce4ec; color: #c62828; }
  `],
})
export class SoporteListComponent implements OnInit {
  tickets: SupportTicket[] = [];
  loading = false;
  search = '';
  filterStatus = '';
  filterPriority = '';
  displayedColumns = ['ticketNumber', 'subject', 'status', 'priority', 'respuestas', 'updatedAt'];

  STATUS_LABELS = STATUS_LABELS;
  PRIORITY_LABELS = PRIORITY_LABELS;
  statusKeys = Object.keys(STATUS_LABELS);
  priorityKeys = Object.keys(PRIORITY_LABELS);

  private debounceTimer: any;

  constructor(
    private service: SoporteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.service.list({
      status: this.filterStatus || undefined,
      priority: this.filterPriority || undefined,
      search: this.search || undefined,
    }).subscribe({
      next: (res) => {
        this.tickets = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilters(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.loadTickets(), 300);
  }
}
