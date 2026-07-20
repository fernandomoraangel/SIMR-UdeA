import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../../features/admin/users/users.service';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ u?.username }}</h2>
    <mat-dialog-content>
      <div *ngIf="loading" class="dlg-loading"><mat-spinner diameter="28"></mat-spinner></div>
      <div *ngIf="!loading && u">
        <p class="dlg-name">{{ u.firstName }} {{ u.lastName }}</p>
        <p class="dlg-row"><span class="lbl">Correo:</span> {{ u.email }}</p>
        <p class="dlg-row"><span class="lbl">Proveedor:</span> {{ u.provider }}</p>
        <p class="dlg-row" *ngIf="u.createdAt">
          <span class="lbl">Creado:</span> {{ u.createdAt | date: 'dd/MM/yyyy' }}
        </p>

        <h3 class="dlg-sub">Roles asignados</h3>
        <p *ngIf="!roles.length" class="dlg-empty">Sin roles asignados.</p>
        <span class="chip" *ngFor="let r of roles">{{ r }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dlg-loading { display: flex; justify-content: center; padding: 20px; }
      .dlg-name { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.1rem; margin: 0 0 8px; }
      .dlg-row { font-family: var(--simr-body); color: var(--simr-tinta); margin: 2px 0; }
      .lbl { opacity: 0.6; }
      .dlg-sub { font-family: var(--simr-body); color: var(--simr-cobre); font-weight: 600; margin: 14px 0 6px; }
      .chip { display: inline-block; font-family: var(--simr-body); font-size: 0.72rem; background: rgba(200,119,46,0.18); color: var(--simr-tinta); border-radius: 10px; padding: 1px 8px; margin: 0 4px 4px 0; }
      .dlg-empty { font-family: var(--simr-body); opacity: 0.6; }
    `,
  ],
})
export class UserDetailDialogComponent implements OnInit {
  u: any = null;
  loading = true;
  roles: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.usersService.getById(this.data.id).subscribe({
      next: (u: any) => {
        this.u = u;
        this.loading = false;
        this.roles = (u.roles || []).map((r: any) =>
          typeof r === 'string' ? r : r.displayName || r.name || r
        );
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
