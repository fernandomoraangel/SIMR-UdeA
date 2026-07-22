import { Component, Input, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DiccionariosService } from '../../features/diccionarios/services/diccionarios.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-help-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <button
      mat-icon-button
      class="help-btn"
      [attr.aria-label]="'Ayuda para ' + campo"
      (click)="open($event)"
      title="Ayuda"
      type="button"
    >
      <mat-icon>help_outline</mat-icon>
    </button>
  `,
  styles: [`
    .help-btn {
      width: 28px; height: 28px;
      line-height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .help-btn mat-icon {
      font-size: 18px; width: 18px; height: 18px;
      color: var(--simr-cobre); opacity: 0.7;
      transition: opacity 0.2s;
    }
    .help-btn:hover mat-icon { opacity: 1; }
  `],
})
export class HelpPopupComponent {
  private readonly dialog = inject(MatDialog);
  private readonly diccionariosService = inject(DiccionariosService);

  @Input({ required: true }) tabla = '';
  @Input({ required: true }) campo = '';

  open(event: MouseEvent) {
    event.stopPropagation();
    this.diccionariosService.getFieldHelp(this.tabla, this.campo)
      .pipe(take(1))
      .subscribe((help) => {
        this.dialog.open(HelpPopupDialogComponent, {
          width: '420px',
          data: {
            tabla: this.tabla,
            campo: this.campo,
            help: help?.definicion || 'Sin descripción disponible.',
          },
        });
      });
  }
}

@Component({
  selector: 'app-help-popup-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="help-dialog">
      <div class="help-header">
        <mat-icon>info_outline</mat-icon>
        <span class="help-campo">{{ data.campo }}</span>
        <span class="help-tabla">{{ data.tabla }}</span>
      </div>
      <p class="help-body">{{ data.help }}</p>
      <div class="help-footer">
        <button mat-stroked-button (click)="close()">Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .help-dialog { padding: 1.5rem; }
    .help-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .help-header mat-icon { color: var(--simr-cobre); }
    .help-campo { font-family: var(--simr-display); font-weight: 600; font-size: 1.1rem; color: var(--simr-tinta); }
    .help-tabla { font-size: 0.75rem; color: var(--simr-musgo); background: var(--simr-papel); padding: 0.15rem 0.5rem; border-radius: 4px; margin-left: auto; font-family: var(--simr-mono); }
    .help-body { color: var(--simr-tinta-2); line-height: 1.6; font-size: 0.95rem; margin: 0 0 1.5rem; }
    .help-footer { display: flex; justify-content: flex-end; }
  `],
})
export class HelpPopupDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HelpPopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tabla: string; campo: string; help: string }
  ) {}
  close() { this.dialogRef.close(); }
}
