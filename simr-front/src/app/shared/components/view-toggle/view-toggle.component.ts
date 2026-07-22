import { Component, input, output, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

export type ViewMode = 'cards' | 'table';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule],
  template: `
    <mat-button-toggle-group
      [value]="view()"
      (change)="onChange($event.value)"
      hideSingleSelectionIndicator="true"
      class="view-toggle"
    >
      <mat-button-toggle value="cards" aria-label="Vista de tarjetas">
        <mat-icon>grid_view</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Vista de tabla">
        <mat-icon>table_rows</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styles: [`
    .view-toggle { border: 1px solid var(--mat-sys-outline); border-radius: 8px; overflow: hidden; }
    .view-toggle mat-button-toggle { font-size: 0; }
    .view-toggle mat-icon { font-size: 20px; width: 20px; height: 20px; line-height: 20px; margin: 0 2px; color: var(--simr-tinta-2); }
    .view-toggle .mat-button-toggle-checked mat-icon { color: var(--simr-tinta); }
  `],
})
export class ViewToggleComponent {
  readonly view = model<ViewMode>('cards');
  readonly viewChange = output<ViewMode>();

  onChange(value: string) {
    const mode = value as ViewMode;
    this.view.set(mode);
    this.viewChange.emit(mode);
  }
}
