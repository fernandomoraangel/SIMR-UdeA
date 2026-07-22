import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AnotacionCartograficoTemporal } from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-anotacion-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="timeline-placeholder">
      <mat-icon>timeline</mat-icon>
      <h3>Línea de tiempo</h3>
      <p>Visualización pendiente de implementar.</p>
      <p class="count">{{ anotaciones().length }} anotacion(es) disponibles.</p>
    </div>
  `,
  styles: [`
    .timeline-placeholder { text-align: center; padding: 2rem; color: var(--simr-tinta-2); border: 1px dashed var(--mat-sys-outline); border-radius: 12px; }
  `],
})
export class AnotacionTimelineComponent {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();
}
