import {
  Component,
  input,
  effect,
  OnDestroy,
  ElementRef,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';
import { AnotacionCartograficoTemporal } from '../models/anotacion-cartografica.interface';

const MEDELLIN: L.LatLngTuple = [6.2476, -75.5658];

// Fix Leaflet default marker icons (broken with bundlers)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-anotacion-map',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (anotacionesConCoordenadas().length === 0) {
      <div class="map-empty">
        <mat-icon>map</mat-icon>
        <p>Ninguna anotación tiene coordenadas aún.</p>
        <p class="hint">Edite las anotaciones para agregar latitud/longitud.</p>
      </div>
    } @else {
      <div class="map-wrapper">
        <div class="map-toolbar">
          <span class="map-count">{{ anotacionesConCoordenadas().length }} punto(s) en el mapa</span>
        </div>
        <div #mapContainer class="map-container"></div>
      </div>
    }
  `,
  styles: [`
    .map-empty {
      text-align: center; padding: 2rem; color: var(--simr-tinta-2);
      border: 1px dashed var(--mat-sys-outline); border-radius: 12px;
    }
    .map-empty mat-icon {
      font-size: 48px; width: 48px; height: 48px;
      color: var(--simr-musgo); opacity: 0.5; margin-bottom: 0.5rem;
    }
    .map-empty .hint { font-size: 0.82rem; opacity: 0.7; }

    .map-wrapper {
      border: 1px solid var(--mat-sys-outline);
      border-radius: 12px;
      overflow: hidden;
    }
    .map-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background: var(--simr-hueso);
      border-bottom: 1px solid var(--mat-sys-outline);
    }
    .map-count {
      font-size: 0.78rem; font-weight: 600; color: var(--simr-tinta-2);
    }
    .map-container {
      width: 100%; height: 500px;
    }
  `],
})
export class AnotacionMapComponent implements AfterViewInit, OnDestroy {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();

  protected mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  private initEffect = effect(() => {
    const anots = this.anotaciones();
    if (this.map && anots) {
      this.renderMarkers();
    }
  });

  ngAfterViewInit() {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    this.map = L.map(container, {
      center: MEDELLIN,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 0);
    setTimeout(() => this.renderMarkers(), 100);
  }

  ngOnDestroy() {
    this.map?.remove();
    this.map = null;
  }

  private renderMarkers() {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const anots = this.anotacionesConCoordenadas();
    if (anots.length === 0) return;

    const bounds: [number, number][] = [];

    for (const a of anots) {
      if (!a.coordenadas || a.coordenadas.length < 2) continue;
      const lat = a.coordenadas[1];
      const lng = a.coordenadas[0];
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;

      const latlng: [number, number] = [lat, lng];
      bounds.push(latlng);

      const popup = this.buildPopup(a);
      const marker = L.marker(latlng).bindPopup(popup, { maxWidth: 280 });
      this.markersLayer.addLayer(marker);
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 15);
    } else if (bounds.length > 1) {
      const b = L.latLngBounds(bounds[0], bounds[0]);
      for (const pt of bounds) b.extend(pt);
      this.map.fitBounds(b, { padding: [40, 40], maxZoom: 16 });
    }
  }

  private buildPopup(a: AnotacionCartograficoTemporal): string {
    const parts: string[] = [];
    parts.push(`<div class="simr-popup">`);

    if (a.evento) {
      parts.push(`<strong>${this.esc(a.evento)}</strong>`);
    }
    if (a.lugar) {
      parts.push(`<span class="popup-lugar">${this.esc(a.lugar)}</span>`);
    }
    if (a.coberturaAmplitud) {
      parts.push(`<span class="popup-cobertura">${this.esc(a.coberturaAmplitud)}</span>`);
    }
    if (a.fechaInicio) {
      const f = a.fechaInicio.split('T')[0].replace(/-/g, '/');
      parts.push(`<span class="popup-fecha">Inicio: ${f}</span>`);
    }
    if (a.fechaFin) {
      const f = a.fechaFin.split('T')[0].replace(/-/g, '/');
      parts.push(`<span class="popup-fecha">Fin: ${f}</span>`);
    }
    if (a.evidencia) {
      parts.push(`<span class="popup-evidencia">${this.esc(a.evidencia)}</span>`);
    }

    parts.push(`</div>`);
    return parts.join('');
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  protected anotacionesConCoordenadas(): AnotacionCartograficoTemporal[] {
    return this.anotaciones().filter(
      (a) => a.coordenadas && a.coordenadas.length >= 2
    );
  }
}
