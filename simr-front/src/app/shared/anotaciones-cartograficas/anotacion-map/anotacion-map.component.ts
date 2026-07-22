import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnotacionCartograficoTemporal } from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-anotacion-map',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="map-placeholder">
      <mat-icon>map</mat-icon>
      <h3>Mapa geográfico</h3>
      <p>Visualización cartográfica pendiente de implementar (Leaflet/OSM).</p>
      @if (anotacionesConCoordenadas().length > 0) {
        <p class="count">{{ anotacionesConCoordenadas().length }} anotacion(es) con coordenadas.</p>
      } @else {
        <p class="count">Ninguna anotación tiene coordenadas aún. Edite las anotaciones para agregar latitud/longitud.</p>
      }
    </div>
  `,
  styles: [`
    .map-placeholder { text-align: center; padding: 2rem; color: var(--simr-tinta-2); border: 1px dashed var(--mat-sys-outline); border-radius: 12px; }
    .map-placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--simr-musgo); opacity: 0.5; }
  `],
})
export class AnotacionMapComponent {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();

  protected anotacionesConCoordenadas(): AnotacionCartograficoTemporal[] {
    return this.anotaciones().filter((a) => a.coordenadas && a.coordenadas.length >= 2);
  }
}
