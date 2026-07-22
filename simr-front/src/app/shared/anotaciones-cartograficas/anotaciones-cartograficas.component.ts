import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnotacionCartograficoTemporal } from './models/anotacion-cartografica.interface';
import { AnotacionFormComponent } from './anotacion-form/anotacion-form.component';
import { AnotacionListComponent } from './anotacion-list/anotacion-list.component';
import { AnotacionTimelineComponent } from './anotacion-timeline/anotacion-timeline.component';
import { AnotacionMapComponent } from './anotacion-map/anotacion-map.component';

export type AnotacionesViewMode = 'edit' | 'timeline' | 'map';

@Component({
  selector: 'app-anotaciones-cartograficas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    AnotacionFormComponent,
    AnotacionListComponent,
    AnotacionTimelineComponent,
    AnotacionMapComponent,
  ],
  template: `
    <div class="anotaciones-container">
      @if (anotaciones().length > 0) {
        <div class="anotaciones-toolbar">
          <mat-button-toggle-group
            [value]="viewMode()"
            (change)="viewMode.set($event.value)"
            dense
          >
            <mat-button-toggle value="edit" matTooltip="Editar lista">
              <mat-icon>list</mat-icon>
              Lista
            </mat-button-toggle>
            <mat-button-toggle value="timeline" matTooltip="Línea de tiempo">
              <mat-icon>timeline</mat-icon>
              Tiempo
            </mat-button-toggle>
            <mat-button-toggle value="map" matTooltip="Mapa">
              <mat-icon>map</mat-icon>
              Mapa
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      }

      @switch (viewMode()) {
        @case ('edit') {
          @if (!readonly()) {
            <app-anotacion-form
              [lugares]="lugares()"
              [coberturas]="coberturas()"
              [editValue]="editingValue()"
              [editingIndex]="editingIndex()"
              [expanded]="formExpanded()"
              (saveAnotacion)="onSaveAnotacion($event)"
              (cancel)="onCancelEdit()"
            />
          }

          <app-anotacion-list
            [anotaciones]="anotaciones()"
            [editable]="!readonly()"
            (edit)="onEdit($event)"
            (remove)="onRemove($event)"
          />
        }
        @case ('timeline') {
          <app-anotacion-timeline
            [anotaciones]="anotaciones()"
            (edit)="onEditFromTimeline($event)"
          />
        }
        @case ('map') {
          <app-anotacion-map [anotaciones]="anotaciones()" />
        }
      }
    </div>
  `,
  styles: [`
    .anotaciones-container { margin: 0.5rem 0; }
    .anotaciones-toolbar { display: flex; justify-content: flex-end; margin-bottom: 0.75rem; }
  `],
})
export class AnotacionesCartograficasComponent {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();
  readonly lugares = input<string[]>([]);
  readonly coberturas = input<string[]>([]);
  readonly readonly = input(false);
  readonly anotacionesChange = output<AnotacionCartograficoTemporal[]>();

  protected viewMode = signal<AnotacionesViewMode>('edit');
  protected editingIndex = signal<number | null>(null);
  protected editingValue = signal<AnotacionCartograficoTemporal | null>(null);
  protected formExpanded = signal(false);

  private currentList: AnotacionCartograficoTemporal[] = [];

  onSaveAnotacion(event: { data: AnotacionCartograficoTemporal; index: number | null }) {
    const list = [...this.anotaciones()];
    if (event.index != null) {
      list[event.index] = event.data;
    } else {
      list.push(event.data);
    }
    this.emitChange(list);
    this.resetForm();
  }

  onEdit(index: number) {
    const list = this.anotaciones();
    this.editingIndex.set(index);
    this.editingValue.set({ ...list[index] });
    this.formExpanded.set(true);
  }

  onRemove(index: number) {
    const list = this.anotaciones().filter((_, i) => i !== index);
    this.emitChange(list);
    if (this.editingIndex() === index) {
      this.resetForm();
    }
  }

  onCancelEdit() {
    this.resetForm();
  }

  onEditFromTimeline(index: number) {
    this.viewMode.set('edit');
    this.onEdit(index);
  }

  private emitChange(list: AnotacionCartograficoTemporal[]) {
    this.currentList = list;
    this.anotacionesChange.emit(list);
  }

  private resetForm() {
    this.editingIndex.set(null);
    this.editingValue.set(null);
    this.formExpanded.set(false);
  }
}
