import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DescriptorLibre {
  etiqueta: string;
  contenido: string;
}

@Component({
  selector: 'app-descriptor-libre-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="descriptor-editor">
      <div class="add-row">
        <mat-form-field appearance="outline" class="field-etiqueta" subscriptSizing="dynamic">
          <mat-label>Etiqueta</mat-label>
          <input matInput [(ngModel)]="newItem.etiqueta" placeholder="Ej: Fuente" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-contenido" subscriptSizing="dynamic">
          <mat-label>Contenido</mat-label>
          <input matInput [(ngModel)]="newItem.contenido" placeholder="Descripción…" />
        </mat-form-field>
        <button
          mat-stroked-button
          class="add-btn"
          (click)="addItem()"
          [disabled]="!canAdd()"
          type="button"
        >
          <mat-icon>add</mat-icon>
          Agregar
        </button>
      </div>

      @if (descriptores.length > 0) {
        <div class="items-list">
          @for (d of descriptores; track $index) {
            <div class="descriptor-item">
              <span class="descriptor-etiqueta">{{ d.etiqueta }}</span>
              <span class="descriptor-contenido">{{ d.contenido }}</span>
              <button class="item-remove" (click)="removeItem($index)" type="button" aria-label="Eliminar">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .descriptor-editor { display: flex; flex-direction: column; gap: 0.75rem; }
    .add-row { display: flex; gap: 0.5rem; align-items: flex-start; }
    .field-etiqueta { flex: 0 0 180px; }
    .field-contenido { flex: 1; }
    .add-btn { margin-top: 0.25rem; white-space: nowrap; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .descriptor-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--simr-papel);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      transition: border-color 0.2s;
    }
    .descriptor-item:hover { border-color: var(--simr-cobre); }
    .descriptor-etiqueta {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--simr-tinta);
      min-width: 120px;
      padding: 0.15rem 0.5rem;
      background: var(--simr-hueso);
      border-radius: 4px;
      text-align: center;
    }
    .descriptor-contenido {
      flex: 1;
      font-size: 0.9rem;
      color: var(--simr-tinta-2);
    }
    .item-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px; height: 24px;
      border: none; background: none;
      cursor: pointer; border-radius: 4px;
      color: var(--simr-sello); opacity: 0.6;
      transition: opacity 0.15s;
      padding: 0;
    }
    .item-remove:hover { opacity: 1; }
    .item-remove mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `],
})
export class DescriptorLibreEditorComponent {
  @Input() descriptores: DescriptorLibre[] = [];
  @Output() descriptoresChange = new EventEmitter<DescriptorLibre[]>();

  newItem: DescriptorLibre = { etiqueta: '', contenido: '' };

  canAdd(): boolean {
    return !!(this.newItem.etiqueta?.trim() && this.newItem.contenido?.trim());
  }

  addItem() {
    this.descriptores = [
      ...this.descriptores,
      {
        etiqueta: this.newItem.etiqueta.trim(),
        contenido: this.newItem.contenido.trim(),
      },
    ];
    this.newItem = { etiqueta: '', contenido: '' };
    this.descriptoresChange.emit(this.descriptores);
  }

  removeItem(index: number) {
    this.descriptores = this.descriptores.filter((_, i) => i !== index);
    this.descriptoresChange.emit(this.descriptores);
  }
}
