import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RolesService } from '../../features/admin/roles/roles.service';

@Component({
  selector: 'app-role-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ rol?.displayName || rol?.name }}</h2>
    <mat-dialog-content>
      <div *ngIf="loading" class="dlg-loading"><mat-spinner diameter="28"></mat-spinner></div>
      <div *ngIf="!loading && rol">
        <p class="dlg-meta">
          <span class="badge" [class.sistema]="rol.isSystem">{{ rol.isSystem ? 'Sistema' : 'Personalizado' }}</span>
          <span class="badge">Prioridad: {{ rol.priority }}</span>
          <span class="badge" [class.activo]="rol.isActive !== false">Activo</span>
        </p>
        <p class="dlg-desc" *ngIf="rol.description">{{ rol.description }}</p>

        <h3 class="dlg-sub">Roles heredados</h3>
        <p *ngIf="!heredados.length" class="dlg-empty">Sin herencia.</p>
        <span class="chip" *ngFor="let h of heredados">{{ h }}</span>

        <h3 class="dlg-sub">Permisos</h3>
        <table mat-table [dataSource]="filas" class="dlg-table" *ngIf="filas.length">
          <ng-container matColumnDef="recurso">
            <th mat-header-cell *matHeaderCellDef>Recurso</th>
            <td mat-cell *matCellDef="let f">{{ f.recurso }}</td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let f">
              <span class="pill" *ngFor="let a of f.acciones">{{ a }}</span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
        <p *ngIf="!filas.length" class="dlg-empty">Sin permisos asignados.</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dlg-loading { display: flex; justify-content: center; padding: 20px; }
      .dlg-meta { display: flex; gap: 8px; flex-wrap: wrap; }
      .badge { font-family: var(--simr-mono); font-size: 0.74rem; background: rgba(31,42,36,0.1); border-radius: 10px; padding: 1px 8px; }
      .badge.sistema { background: rgba(181,67,42,0.18); color: var(--simr-sello); }
      .badge.activo { background: rgba(46,125,89,0.18); color: #2e7f59; }
      .dlg-desc { font-family: var(--simr-body); color: var(--simr-tinta); opacity: 0.85; }
      .dlg-sub { font-family: var(--simr-body); color: var(--simr-cobre); font-weight: 600; margin: 14px 0 6px; }
      .chip { display: inline-block; font-family: var(--simr-body); font-size: 0.72rem; background: rgba(200,119,46,0.18); color: var(--simr-tinta); border-radius: 10px; padding: 1px 8px; margin: 0 4px 4px 0; }
      .dlg-table { width: 100%; background: var(--simr-hueso); }
      .pill { display: inline-block; font-family: var(--simr-mono); font-size: 0.7rem; background: rgba(31,42,36,0.08); border-radius: 8px; padding: 1px 6px; margin: 0 4px 4px 0; }
      .dlg-empty { font-family: var(--simr-body); opacity: 0.6; }
    `,
  ],
})
export class RoleDetailDialogComponent implements OnInit {
  rol: any = null;
  loading = true;
  cols = ['recurso', 'acciones'];
  filas: { recurso: string; acciones: string[] }[] = [];
  heredados: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<RoleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; nombre?: string },
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.rolesService.getById(this.data.id).subscribe({
      next: (r: any) => {
        this.rol = r;
        this.loading = false;
        const perms = r.permissions || {};
        this.filas = Object.keys(perms).map((recurso) => {
          const acciones = Object.keys(perms[recurso] || {}).map(
            (acc) => `${acc}:${perms[recurso][acc]}`
          );
          return { recurso, acciones };
        });
        this.heredados = (r.inheritsFrom || []).map((h: any) =>
          typeof h === 'string' ? h : h.displayName || h.name || h
        );
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
