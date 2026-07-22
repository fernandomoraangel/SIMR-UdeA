import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnOption {
  key: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, FormsModule],
  template: `
    <div class="selector">
      <h2 mat-dialog-title>{{ data.title || 'Campos visibles' }}</h2>
      <mat-dialog-content>
        <p class="hint">Selecciona los campos que quieres ver en la lista.</p>
        <div class="field-list">
          @for (opt of data.columns; track opt.key) {
            <label class="field-row">
              <mat-checkbox [(ngModel)]="opt.checked" [disabled]="!!data.required?.includes(opt.key)">
                {{ opt.label }}
              </mat-checkbox>
            </label>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="null">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="data.columns">Aplicar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .selector { padding: 4px 4px 8px; font-family: var(--simr-body); min-width: 280px; }
    h2 { font-family: var(--simr-display); color: var(--simr-tinta); margin-bottom: 0; }
    .hint { font-size: 0.85rem; color: var(--simr-tinta-2); margin: 0.5rem 0 1rem; }
    .field-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .field-row { display: flex; align-items: center; cursor: pointer; border-radius: 6px; padding: 0.25rem 0.5rem; transition: background 0.15s; }
    .field-row:hover { background: var(--simr-papel); }
  `],
})
export class ColumnSelectorComponent {
  constructor(
    public dialogRef: MatDialogRef<ColumnSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { columns: ColumnOption[]; required?: string[]; title?: string }
  ) {}
}
