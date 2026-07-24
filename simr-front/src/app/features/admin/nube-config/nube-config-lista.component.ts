import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NubeConfigService } from './nube-config.service';

@Component({
  selector: 'app-nube-config-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <h1 class="admin-title">Configuraci&oacute;n de Nube de Archivos</h1>
        <button mat-button routerLink="/admin"><mat-icon>arrow_back</mat-icon> Volver</button>
      </header>

      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>

      <mat-card appearance="outlined" *ngIf="!loading">
        <form (ngSubmit)="guardar()" class="form-grid">
          <p class="simr-eyebrow">
            Define el tama&ntilde;o m&aacute;ximo permitido para archivos subidos a la nube de archivos (MinIO).
          </p>

          <mat-form-field appearance="outline">
            <mat-label>Tama&ntilde;o m&aacute;ximo (MB)</mat-label>
            <input
              matInput
              type="number"
              min="1"
              max="10000"
              [(ngModel)]="maxFileSizeMB"
              name="maxFileSizeMB"
              required
            />
            <mat-hint>M&iacute;nimo 1 MB, m&aacute;ximo 10000 MB (~10 GB)</mat-hint>
          </mat-form-field>

          <div class="form-acciones">
            <button mat-flat-button color="primary" type="submit" [disabled]="saving">
              <mat-icon>save</mat-icon> Guardar configuraci&oacute;n
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 720px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
      .simr-eyebrow { font-family: var(--simr-body); color: var(--simr-apunte); font-size: 0.88rem; margin: 0 0 18px; }
      .form-grid { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
      .form-acciones { margin-top: 12px; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
    `,
  ],
})
export class NubeConfigListaComponent implements OnInit {
  maxFileSizeMB = 200;
  loading = false;
  saving = false;

  constructor(
    private configService: NubeConfigService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.configService.get().subscribe({
      next: (cfg) => {
        this.maxFileSizeMB = cfg.maxFileSizeMB;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error al cargar configuración', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar(): void {
    if (!this.maxFileSizeMB || this.maxFileSizeMB < 1) {
      this.snack.open('El tamaño debe ser mayor a 0 MB.', 'Cerrar', { duration: 2500 });
      return;
    }

    this.saving = true;
    this.configService.update(this.maxFileSizeMB).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Configuración guardada.', 'Cerrar', { duration: 2500 });
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err, 'Cerrar', { duration: 3000 });
      },
    });
  }
}
