import { Component, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ImpreciseDateInputComponent } from '../imprecise-date-input/imprecise-date-input.component';
import { AnotacionCartograficoTemporal, precisionFecha, toDisplayFecha } from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-anotacion-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatSelectModule,
    MatButtonModule, MatIconModule,
    ImpreciseDateInputComponent,
  ],
  template: `
    <div class="anotacion-card">
      <div class="anotacion-card-header">
        <span class="anotacion-card-title">
          @if (editingIndex() !== null) {
            Editando anotación #{{ editingIndex()! + 1 }}
          } @else {
            Nueva anotación cartográfico temporal
          }
        </span>
        @if (editingIndex() !== null) {
          <button mat-button (click)="cancelEdit()" type="button">
            <mat-icon>close</mat-icon>
            Cancelar
          </button>
        }
      </div>

      <div class="form-grid" [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Lugar</mat-label>
          <input matInput formControlName="lugar" [matAutocomplete]="autoLugar" />
          <mat-autocomplete #autoLugar="matAutocomplete" (optionSelected)="onLugarSelect($event)">
            @for (l of filteredLugares(); track l) {
              <mat-option [value]="l">{{ l }}</mat-option>
            }
            @if (filteredLugares().length === 0 && lugarSearch().trim()) {
              <mat-option [value]="lugarSearch().trim()">
                <em>Usar "{{ lugarSearch().trim() }}"</em>
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cobertura / Amplitud</mat-label>
          <mat-select formControlName="coberturaAmplitud">
            <mat-option value="">— Seleccione —</mat-option>
            @for (c of coberturas(); track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Evento</mat-label>
          <input matInput formControlName="evento" placeholder="Descripción del evento o circunstancia" />
        </mat-form-field>

        <div class="date-row">
          <app-imprecise-date-input
            label="Fecha inicio"
            [value]="form.controls.fechaInicio.value || ''"
            (valueChange)="form.controls.fechaInicio.setValue($event)"
            (precisionChange)="form.controls.precisionInicio.setValue($event)"
          />
          <app-imprecise-date-input
            label="Fecha fin"
            [value]="form.controls.fechaFin.value || ''"
            (valueChange)="form.controls.fechaFin.setValue($event)"
            (precisionChange)="form.controls.precisionFin.setValue($event)"
          />
        </div>

        <div class="coord-row" formGroupName="coordenadas">
          <mat-form-field appearance="outline" class="coord-field">
            <mat-label>Latitud</mat-label>
            <input matInput type="number" formControlName="latitud" placeholder="Ej: 6.2476" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="coord-field">
            <mat-label>Longitud</mat-label>
            <input matInput type="number" formControlName="longitud" placeholder="Ej: -75.5658" />
          </mat-form-field>
          @if (form.controls.coordenadas.controls.latitud.value && form.controls.coordenadas.controls.longitud.value) {
            <button mat-stroked-button (click)="abrirMapa()" title="Ver en mapa" type="button">
              <mat-icon>open_in_new</mat-icon>
              Mapa
            </button>
          }
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Evidencia / fuente</mat-label>
          <input matInput formControlName="evidencia" placeholder="Fuente de los datos" />
        </mat-form-field>
      </div>

      <div class="anotacion-card-actions">
        <button mat-flat-button color="primary" (click)="save()" [disabled]="!hasData()" type="button">
          <mat-icon>{{ editingIndex() !== null ? 'save' : 'add' }}</mat-icon>
          {{ editingIndex() !== null ? 'Actualizar' : 'Agregar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .anotacion-card {
      background: var(--simr-hueso);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 12px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    .anotacion-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline);
    }
    .anotacion-card-title { font-size: 0.85rem; font-weight: 600; color: var(--simr-tinta); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; padding: 1rem; }
    .full-width { grid-column: 1 / -1; }
    .date-row { grid-column: 1 / -1; display: flex; gap: 1rem; flex-wrap: wrap; }
    .coord-row { grid-column: 1 / -1; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .coord-field { width: 140px; }
    .anotacion-card-actions {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.5rem 1rem 0.75rem;
    }
  `],
})
export class AnotacionFormComponent {
  readonly lugares = input<string[]>([]);
  readonly coberturas = input<string[]>([]);
  readonly editValue = input<AnotacionCartograficoTemporal | null>(null);
  readonly editingIndex = input<number | null>(null);
  readonly expanded = input(false);

  readonly saveAnotacion = output<{ data: AnotacionCartograficoTemporal; index: number | null }>();
  readonly cancel = output<void>();

  protected form = new FormGroup({
    lugar: new FormControl(''),
    coberturaAmplitud: new FormControl(''),
    evento: new FormControl(''),
    fechaInicio: new FormControl(''),
    fechaFin: new FormControl(''),
    precisionInicio: new FormControl(''),
    precisionFin: new FormControl(''),
    evidencia: new FormControl(''),
    coordenadas: new FormGroup({
      latitud: new FormControl<number | null>(null),
      longitud: new FormControl<number | null>(null),
    }),
  });

  protected lugarSearch = signal('');

  protected filteredLugares = computed(() => {
    const term = this.lugarSearch().toLowerCase();
    return this.lugares().filter((l) => l.toLowerCase().includes(term));
  });

  constructor() {
    this.form.controls.lugar.valueChanges.subscribe((val) => {
      this.lugarSearch.set(val || '');
    });

    effect(() => {
      const edit = this.editValue();
      if (edit) {
        this.form.patchValue({
          lugar: edit.lugar || '',
          coberturaAmplitud: edit.coberturaAmplitud || '',
          evento: edit.evento || '',
          fechaInicio: edit.fechaInicio ? toDisplayFecha(edit.fechaInicio) : '',
          fechaFin: edit.fechaFin ? toDisplayFecha(edit.fechaFin) : '',
          precisionInicio: edit.precisionInicio || '',
          precisionFin: edit.precisionFin || '',
          evidencia: edit.evidencia || '',
          coordenadas: {
            latitud: edit.coordenadas && edit.coordenadas.length >= 2 ? edit.coordenadas[1] : null,
            longitud: edit.coordenadas && edit.coordenadas.length >= 2 ? edit.coordenadas[0] : null,
          },
        });
      }
    });
  }

  protected hasData(): boolean {
    const f = this.form.getRawValue();
    return !!(f.lugar || f.evento || f.coberturaAmplitud || f.fechaInicio || f.fechaFin || f.evidencia);
  }

  onLugarSelect(event: MatAutocompleteSelectedEvent) {
    this.form.controls.lugar.setValue(event.option.value);
  }

  abrirMapa() {
    const lat = this.form.controls.coordenadas.controls.latitud.value;
    const lng = this.form.controls.coordenadas.controls.longitud.value;
    if (lat != null && lng != null) {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`, '_blank');
    }
  }

  save() {
    const raw = this.form.getRawValue();
    const toISO = (v: string | null): string | undefined => {
      if (!v) return undefined;
      const normalized = precisionFecha(v);
      const parts = normalized.fecha.split('/');
      const y = parseInt(parts[0], 10) || 2000;
      const m = parseInt(parts[1], 10) || 1;
      const d = parseInt(parts[2], 10) || 1;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };
    const data: AnotacionCartograficoTemporal = {
      lugar: raw.lugar || undefined,
      coberturaAmplitud: raw.coberturaAmplitud || undefined,
      evento: raw.evento || undefined,
      fechaInicio: toISO(raw.fechaInicio),
      fechaFin: toISO(raw.fechaFin),
      precisionInicio: raw.precisionInicio || undefined,
      precisionFin: raw.precisionFin || undefined,
      evidencia: raw.evidencia || undefined,
    };
    const lat = raw.coordenadas.latitud;
    const lng = raw.coordenadas.longitud;
    if (lat != null && lng != null) {
      data.coordenadas = [lng, lat];
    }
    this.saveAnotacion.emit({ data, index: this.editingIndex() });
    this.resetForm();
  }

  cancelEdit() {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm() {
    this.form.reset({
      lugar: '',
      coberturaAmplitud: '',
      evento: '',
      fechaInicio: '',
      fechaFin: '',
      precisionInicio: '',
      precisionFin: '',
      evidencia: '',
      coordenadas: { latitud: null, longitud: null },
    });
  }
}
