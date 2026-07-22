import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { precisionFecha, formatDate } from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-imprecise-date-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatIconModule],
  template: `
    <div class="date-input-container">
      <mat-form-field appearance="outline" class="date-field" [class.invalid]="!isValid() && touched()">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          type="text"
          [value]="inputValue()"
          (input)="onInput($any($event.target).value)"
          (blur)="onBlur()"
          [placeholder]="placeholder()"
          maxlength="10"
          class="date-text"
        />
        @if (inputValue()) {
          <button matSuffix mat-icon-button (click)="clear()" tabindex="-1" type="button">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      @if (preview(); as p) {
        <span class="preview">{{ p }}</span>
      }
      @if (errorMsg(); as err) {
        <span class="error-msg">{{ err }}</span>
      }
    </div>
  `,
  styles: [`
    .date-input-container { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .date-field { width: 160px; }
    .date-field.invalid .mat-mdc-input-element { color: var(--simr-sello); }
    .date-text { font-family: var(--simr-mono); letter-spacing: 0.05em; }
    .preview { font-size: 0.82rem; color: var(--simr-tinta-2); font-style: italic; min-width: 100px; }
    .error-msg { font-size: 0.75rem; color: var(--simr-sello); }
  `],
})
export class ImpreciseDateInputComponent {
  readonly label = input('Fecha');
  readonly placeholder = input('AAAA/MM/DD');
  readonly value = input<string>('');
  readonly valueChange = output<string>();
  readonly precisionChange = output<string>();

  protected inputValue = signal('');
  protected touched = signal(false);

  protected isValid = computed(() => {
    const v = this.inputValue();
    if (!v) return true;
    return /^(\d{4}|0)\/([0-9][0-9]|0)\/([0-9][0-9]|0)$/.test(v);
  });

  protected errorMsg = computed(() => {
    if (!this.touched() || this.isValid()) return '';
    return 'Formato: AAAA/MM/DD (use 0 si desconoce)';
  });

  protected preview = computed(() => {
    const v = this.inputValue();
    if (!v || !this.isValid()) return '';
    const parts = v.split('/');
    const { precision } = precisionFecha(v);
    return formatDate(parts[0], parts[1], parts[2], precision);
  });

  constructor() {
    effect(() => {
      this.inputValue.set(this.value());
    });
  }

  onInput(val: string) {
    const cleaned = val.replace(/[^0-9/]/g, '').substring(0, 10);
    this.inputValue.set(cleaned);
    this.valueChange.emit(cleaned);
    if (this.isValid() && cleaned) {
      const { precision } = precisionFecha(cleaned);
      this.precisionChange.emit(precision);
    }
  }

  onBlur() {
    this.touched.set(true);
  }

  clear() {
    this.inputValue.set('');
    this.valueChange.emit('');
    this.precisionChange.emit('');
  }
}
