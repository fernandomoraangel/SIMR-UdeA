import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PATTERNS, ERROR_MESSAGES } from '../validators/patterns';

@Component({
  selector: 'app-list-editor',
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
    <div class="list-editor">
      <div class="add-row">
        <mat-form-field appearance="outline" class="input-field" subscriptSizing="dynamic">
          <mat-label>{{ placeholder }}</mat-label>
          <input
            matInput
            [(ngModel)]="newItem"
            (keydown.enter)="$event.preventDefault(); addItem()"
            #inputField
          />
        </mat-form-field>
        <button
          mat-stroked-button
          class="add-btn"
          (click)="addItem()"
          [disabled]="!newItem?.trim()"
          type="button"
        >
          <mat-icon>add</mat-icon>
          Agregar
        </button>
      </div>
      @if (errorMsg && showError) {
        <p class="error-msg">{{ errorMsg }}</p>
      }
      @if (value && value.length > 0) {
        <div class="items-list">
          @for (item of value; track $index) {
            <span class="item-chip">
              <span class="item-text">{{ item }}</span>
              <button
                class="item-remove"
                (click)="removeItem($index)"
                type="button"
                aria-label="Eliminar"
              >
                <mat-icon>close</mat-icon>
              </button>
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .list-editor { display: flex; flex-direction: column; gap: 0.75rem; }
    .add-row { display: flex; gap: 0.5rem; align-items: flex-start; }
    .input-field { flex: 1; }
    .add-btn { margin-top: 0.25rem; white-space: nowrap; }
    .items-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .item-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--simr-papel);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 6px;
      padding: 0.3rem 0.3rem 0.3rem 0.75rem;
      font-size: 0.85rem;
      color: var(--simr-tinta);
      transition: border-color 0.2s;
    }
    .item-chip:hover { border-color: var(--simr-cobre); }
    .item-remove {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; background: none;
      cursor: pointer; border-radius: 4px;
      color: var(--simr-sello); opacity: 0.6; transition: opacity 0.15s; padding: 0;
    }
    .item-remove:hover { opacity: 1; }
    .item-remove mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .error-msg { color: var(--simr-sello); font-size: 0.8rem; margin: 0; }
  `],
})
export class ListEditorComponent {
  @Input() value: string[] = [];
  @Input() placeholder = 'Agregar item…';
  @Input() pattern: RegExp | null = null;
  @Input() errorMsg = '';

  @Output() valueChange = new EventEmitter<string[]>();

  newItem = '';
  showError = false;

  addItem() {
    const val = this.newItem?.trim();
    if (!val) return;

    if (this.pattern && !this.pattern.test(val)) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.value = [...this.value, val];
    this.newItem = '';
    this.valueChange.emit(this.value);
  }

  removeItem(index: number) {
    this.value = this.value.filter((_, i) => i !== index);
    this.valueChange.emit(this.value);
  }
}
