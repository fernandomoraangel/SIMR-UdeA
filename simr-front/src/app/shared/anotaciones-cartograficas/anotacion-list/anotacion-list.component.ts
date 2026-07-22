import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnotacionCartograficoTemporal, formatAnotacionParaDisplay } from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-anotacion-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    @if (anotaciones().length === 0) {
      <p class="empty">No hay anotaciones cartográfico temporales.</p>
    } @else {
      <div class="anotacion-items">
        @for (a of anotaciones(); track $index) {
          <div class="anotacion-item">
            <div class="anotacion-content">
              <span class="index-badge">{{ $index + 1 }}</span>
              <span class="anotacion-text">{{ formatAnotacion(a) }}</span>
            </div>
            @if (editable()) {
              <div class="anotacion-actions">
                <button mat-icon-button type="button" (click)="edit.emit($index)" matTooltip="Editar" size="small">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button type="button" (click)="remove.emit($index)" matTooltip="Eliminar" color="warn" size="small">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .empty { font-size: 0.85rem; color: var(--simr-tinta-2); text-align: center; padding: 1rem; }
    .anotacion-items { display: flex; flex-direction: column; gap: 0.4rem; }
    .anotacion-item { display: flex; justify-content: space-between; align-items: center; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.5rem 0.75rem; gap: 0.5rem; }
    .anotacion-content { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; }
    .index-badge { background: var(--simr-musgo); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .anotacion-text { font-size: 0.84rem; color: var(--simr-tinta); line-height: 1.4; }
    .anotacion-actions { display: flex; gap: 0.15rem; flex-shrink: 0; }
    .anotacion-actions button { width: 28px; height: 28px; line-height: 28px; }
    .anotacion-actions button mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class AnotacionListComponent {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();
  readonly editable = input(true);
  readonly edit = output<number>();
  readonly remove = output<number>();

  protected formatAnotacion(a: AnotacionCartograficoTemporal): string {
    return formatAnotacionParaDisplay(a);
  }
}
