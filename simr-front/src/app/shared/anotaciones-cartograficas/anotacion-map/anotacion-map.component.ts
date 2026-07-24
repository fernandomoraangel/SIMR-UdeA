import {
  Component,
  input,
  effect,
  OnDestroy,
  ElementRef,
  viewChild,
  NgZone,
  ChangeDetectorRef,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import maplibregl from 'maplibre-gl';
import { AnotacionCartograficoTemporal, toDisplayFecha, formatDate } from '../models/anotacion-cartografica.interface';

interface AnotacionWithColor extends AnotacionCartograficoTemporal {
  color?: string;
  entidadKey?: string;
  entidadLabel?: string;
  entidadNombre?: string;
}

const MEDELLIN: [number, number] = [-75.5658, 6.2476];

@Component({
  selector: 'app-anotacion-map',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="map-root">
      <div class="map-toolbar">
        <span class="map-count">
          @if (anotacionesConCoordenadas().length > 0) {
            {{ anotacionesConCoordenadas().length }} punto(s) en el mapa
          } @else {
            Sin coordenadas
          }
        </span>
      </div>
      <div class="map-area">
        <div #mapContainer class="map-container"></div>
        @if (anotacionesConCoordenadas().length === 0) {
          <div class="map-empty">
            <mat-icon>map</mat-icon>
            <p>Ninguna anotación tiene coordenadas aún.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .map-root {
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
    .map-area {
      width: 100%;
      height: 500px;
      position: relative;
    }
    .map-container {
      width: 100%;
      height: 500px;
      position: relative;
    }
    .map-empty {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: var(--simr-tinta-2); z-index: 10;
      background: var(--simr-papel);
    }
    .map-empty mat-icon {
      font-size: 48px; width: 48px; height: 48px;
      color: var(--simr-musgo); opacity: 0.5; margin-bottom: 0.5rem;
    }
  `],
})
export class AnotacionMapComponent implements OnDestroy {
  readonly anotaciones = input.required<AnotacionWithColor[]>();

  protected mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: maplibregl.Map | null = null;
  private popup: maplibregl.Popup | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;
  private initialized = false;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      setTimeout(() => {
        if (this.destroyed || this.initialized) return;
        this.initialized = true;
        this.zone.runOutsideAngular(() => this.initMap());
      }, 1500);
    });
  }

  private initMap() {
    const el = this.mapContainer()?.nativeElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      setTimeout(() => this.initMap(), 500);
      return;
    }

    const coords = this.anotacionesConCoordenadas();
    let center: [number, number] = MEDELLIN;
    let zoom = 12;

    if (coords.length === 1) {
      center = [Number(coords[0].coordenadas![0]), Number(coords[0].coordenadas![1])];
      zoom = 15;
    } else if (coords.length > 1) {
      const lngs: number[] = [];
      const lats: number[] = [];
      for (const a of coords) {
        const c = a.coordenadas!;
        lngs.push(Number(c[0]));
        lats.push(Number(c[1]));
      }
      center = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
      ];
      zoom = 14;
    }

    this.map = new maplibregl.Map({
      container: el,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            minzoom: 1,
            maxzoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
        }],
      },
      center,
      zoom,
      attributionControl: {},
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-left');

    this.map.on('load', () => {
      if (this.destroyed || !this.map) return;
      this.map.resize();
      this.syncMarkers();
      this.setupInteractions();
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.map?.resize();
    });
    this.resizeObserver.observe(el);
  }

  private setupInteractions() {
    if (!this.map) return;

    this.map.on('click', 'markers', (e) => {
      if (!this.map) return;
      const feature = e.features?.[0];
      if (!feature || !feature.properties) return;
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

      this.popup?.remove();
      const props = feature.properties as AnotacionWithColor;
      this.popup = new maplibregl.Popup({
        maxWidth: '340px',
        closeButton: true,
        closeOnClick: false,
      })
        .setLngLat(coords)
        .setHTML(this.buildPopup(props))
        .addTo(this.map);
    });

    this.map.on('mouseenter', 'markers', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'markers', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });
  }

  private dataEffect = effect(() => {
    const anots = this.anotaciones();
    if (this.map && anots) {
      this.syncMarkers();
    }
  });

  private syncMarkers() {
    if (!this.map) return;
    const anots = this.anotacionesConCoordenadas();

    const features: GeoJSON.Feature<GeoJSON.Point, AnotacionWithColor>[] = [];
    for (const a of anots) {
      if (!a.coordenadas || a.coordenadas.length < 2) continue;
      const lng = Number(a.coordenadas[0]);
      const lat = Number(a.coordenadas[1]);
      if (isNaN(lat) || isNaN(lng)) continue;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          ...a,
          color: a.color || '#c8772e'
        },
      });
    }

    const source = this.map.getSource('markers') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData({ type: 'FeatureCollection', features });
    } else if (features.length > 0) {
      this.map.addSource('markers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });
      this.map.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': 10,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }
    
    const layer = this.map.getLayer('markers');
    if (layer) {
      this.map.setPaintProperty('markers', 'circle-color', ['get', 'color']);
    }
  }

  private buildPopup(a: AnotacionWithColor): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const rows: string[] = [];

    const tipoEntidad = a.entidadLabel || a.entidadKey;
    if (tipoEntidad) {
      rows.push(`<div style="font-size:0.6rem;color:#8f9080;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1px">${esc(tipoEntidad)}</div>`);
    }

    if (a.entidadNombre) {
      rows.push(`<div style="font-size:0.9rem;font-weight:600;color:#2f3d35;margin-bottom:6px">${esc(a.entidadNombre)}</div>`);
    }

    if (a.evento) {
      rows.push(`<div style="font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:1rem;color:#1f2a24;border-bottom:1px solid #cdbfa6;padding-bottom:5px;margin-bottom:7px;letter-spacing:-0.01em">${esc(a.evento)}</div>`);
    }

    if (a.lugar) {
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Lugar</span><span style="color:#1f2a24">${esc(a.lugar)}</span></div>`);
    }

    if (a.coberturaAmplitud) {
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Cobertura</span><span style="font-style:italic;color:#2f3d35">${esc(a.coberturaAmplitud)}</span></div>`);
    }

    if (a.fechaInicio) {
      const f = toDisplayFecha(a.fechaInicio);
      const [y, m, d] = f.split('/');
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Inicio</span><span style="color:#1f2a24">${formatDate(y, m, d, a.precisionInicio || 'AMD')}</span></div>`);
    }

    if (a.fechaFin) {
      const f = toDisplayFecha(a.fechaFin);
      const [y, m, d] = f.split('/');
      rows.push(`<div style="margin-bottom:4px"><span style="display:inline-block;min-width:68px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#5c7a5a">Fin</span><span style="color:#1f2a24">${formatDate(y, m, d, a.precisionFin || 'AMD')}</span></div>`);
    }

    if (a.evidencia) {
      rows.push(`<div style="font-size:0.78rem;color:#4a5a50;border-top:1px solid #e7ded0;padding-top:5px;margin-top:5px;font-style:italic">${esc(a.evidencia)}</div>`);
    }

    if (a.coordenadas && a.coordenadas.length >= 2) {
      const lat = Number(a.coordenadas[1]);
      const lng = Number(a.coordenadas[0]);
      if (!isNaN(lat) && !isNaN(lng)) {
        rows.push(`<div style="font-size:0.65rem;color:#8f9080;margin-top:3px;font-family:'IBM Plex Mono',monospace">${lat.toFixed(4)}°N · ${lng.toFixed(4)}°W</div>`);
      }
    }

    return rows.join('');
  }

  protected anotacionesConCoordenadas(): AnotacionWithColor[] {
    return this.anotaciones().filter((a) => a.coordenadas && a.coordenadas.length >= 2);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.popup?.remove();
    this.popup = null;
    this.map?.remove();
    this.map = null;
  }
}
