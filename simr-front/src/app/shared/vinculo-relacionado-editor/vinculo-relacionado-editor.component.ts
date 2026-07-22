import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PATTERNS, ERROR_MESSAGES } from '../validators/patterns';

export interface VinculoRelacionado {
  etiqueta: string;
  url: string;
}

@Component({
  selector: 'app-vinculo-relacionado-editor',
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
    <div class="vinculo-editor">
      <div class="add-row">
        <mat-form-field appearance="outline" class="field-etiqueta" subscriptSizing="dynamic">
          <mat-label>Etiqueta</mat-label>
          <input matInput [(ngModel)]="newItem.etiqueta" placeholder="Ej: Partitura digital" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-url" subscriptSizing="dynamic">
          <mat-label>URL</mat-label>
          <input matInput [(ngModel)]="newItem.url" placeholder="https://..." />
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
      @if (urlError) {
        <p class="error-msg">{{ urlError }}</p>
      }
      @if (vinculos.length > 0) {
        <div class="items-list">
          @for (v of vinculos; track $index) {
            <div class="vinculo-item">
              <span class="vinculo-etiqueta">{{ v.etiqueta }}</span>
              <a class="vinculo-url" [href]="v.url" target="_blank" rel="noopener">
                {{ v.url }}
              </a>
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
    .vinculo-editor { display: flex; flex-direction: column; gap: 0.75rem; }
    .add-row { display: flex; gap: 0.5rem; align-items: flex-start; }
    .field-etiqueta { flex: 0 0 200px; }
    .field-url { flex: 1; }
    .add-btn { margin-top: 0.25rem; white-space: nowrap; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .vinculo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--simr-papel);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      transition: border-color 0.2s;
    }
    .vinculo-item:hover { border-color: var(--simr-cobre); }
    .vinculo-etiqueta {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--simr-tinta);
      min-width: 120px;
    }
    .vinculo-url {
      flex: 1;
      font-size: 0.82rem;
      color: var(--simr-musgo);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .vinculo-url:hover { text-decoration: underline; color: var(--simr-cobre); }
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
    .error-msg { color: var(--simr-sello); font-size: 0.8rem; margin: 0; }
  `],
})
export class VinculoRelacionadoEditorComponent {
  @Input() vinculos: VinculoRelacionado[] = [];
  @Output() vinculosChange = new EventEmitter<VinculoRelacionado[]>();

  newItem: VinculoRelacionado = { etiqueta: '', url: '' };
  urlError = '';

  canAdd(): boolean {
    return !!(this.newItem.etiqueta?.trim() && this.newItem.url?.trim());
  }

  addItem() {
    const url = this.newItem.url.trim();
    if (!PATTERNS.url.test(url)) {
      this.urlError = ERROR_MESSAGES.url;
      return;
    }
    this.urlError = '';
    this.vinculos = [
      ...this.vinculos,
      { etiqueta: this.newItem.etiqueta.trim(), url },
    ];
    this.newItem = { etiqueta: '', url: '' };
    this.vinculosChange.emit(this.vinculos);
  }

  removeItem(index: number) {
    this.vinculos = this.vinculos.filter((_, i) => i !== index);
    this.vinculosChange.emit(this.vinculos);
  }
}
