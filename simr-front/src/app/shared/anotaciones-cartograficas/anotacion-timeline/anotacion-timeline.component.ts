import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxTimelineComponent,
  NgxTimelineEvent,
  NgxTimelineEventGroup,
  NgxTimelineEventChangeSide,
  NgxTimelineItem,
} from '@frxjs/ngx-timeline';
import {
  AnotacionCartograficoTemporal,
  formatDate,
  toDisplayFecha,
} from '../models/anotacion-cartografica.interface';

@Component({
  selector: 'app-anotacion-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxTimelineComponent,
  ],
  template: `
    <div class="timeline-container">
      <div class="timeline-filters">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Evento, lugar..." />
          @if (searchTerm) {
            <button matSuffix mat-icon-button (click)="searchTerm = ''" type="button">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field filter-small">
          <mat-label>Agrupar por</mat-label>
          <mat-select [(ngModel)]="groupEventValue">
            <mat-option [value]="'YEAR'">Año</mat-option>
            <mat-option [value]="'MONTH_YEAR'">Mes/Año</mat-option>
            <mat-option [value]="'DAY_MONTH_YEAR'">Día/Mes/Año</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (filteredEvents().length === 0) {
        <div class="timeline-empty">
          <mat-icon>timeline</mat-icon>
          <p>No hay anotaciones que coincidan con los filtros.</p>
        </div>
      } @else {
        <ngx-timeline
          [events]="filteredEvents()"
          [langCode]="'es'"
          [groupEvent]="currentGroupEvent()"
          [changeSide]="NgxTimelineEventChangeSide.ON_DIFFERENT_DAY_IN_GROUP"
          [eventCustomTemplate]="eventTpl"
          [dateInstantCustomTemplate]="dateInstantTpl"
          (clickEmitter)="onTimelineClick($event)"
        />
      }
    </div>

    <ng-template #eventTpl let-event="event">
      <div
        class="tl-entry"
        [class.tl-entry--range]="isRange(event)"
        [class.tl-entry--punctual]="!isRange(event)"
        (click)="onEntryClick(event)"
      >
        <div
          class="tl-dot"
          [class.tl-dot--range]="isRange(event)"
          [class.tl-dot--punctual]="!isRange(event)"
        ></div>
        <div class="tl-info">
          @if (getEntidadLabel(event); as entLabel) {
            <span class="tl-info__ent-tipo">{{ entLabel }}</span>
          }
          @if (getEntidadNombre(event); as entNom) {
            <span class="tl-info__ent-nombre">{{ entNom }}</span>
          }
          @if (getEvento(event); as ev) {
            <span class="tl-info__evento">{{ ev }}</span>
          }
          @if (getLugar(event); as lug) {
            <span class="tl-info__lugar">
              <mat-icon>place</mat-icon>{{ lug }}
            </span>
          }
          @if (getCobertura(event); as cob) {
            <span class="tl-info__cobertura">{{ cob }}</span>
          }
          <span class="tl-info__fecha">{{ event.eventInfo?.description }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #dateInstantTpl let-item></ng-template>
  `,
  styles: [`
    .timeline-container { margin: 0.5rem 0; }

    .timeline-filters {
      display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;
      align-items: flex-start;
    }
    .filter-field { flex: 1; min-width: 180px; }
    .filter-small { flex: 0 0 180px; min-width: 140px; }

    .timeline-empty {
      text-align: center; padding: 2rem; color: var(--simr-tinta-2);
      border: 1px dashed var(--mat-sys-outline); border-radius: 12px;
    }
    .timeline-empty mat-icon {
      font-size: 48px; width: 48px; height: 48px; opacity: 0.4; margin-bottom: 0.5rem;
    }

    /* ── Entry row ── */
    .tl-entry {
      display: flex; align-items: flex-start; gap: 0.6rem;
      padding: 0.35rem 0;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .tl-entry:hover { background: rgba(200, 119, 46, 0.06); }

    /* ── Punctual dot (circle) ── */
    .tl-dot {
      flex-shrink: 0;
      margin-top: 3px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .tl-dot--punctual {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--simr-cobre);
    }
    /* ── Range dot (diamond) ── */
    .tl-dot--range {
      width: 10px; height: 10px;
      background: var(--simr-musgo);
      border-radius: 2px;
      transform: rotate(45deg);
    }

    .tl-entry:hover .tl-dot {
      transform: scale(1.4);
      box-shadow: 0 0 0 3px rgba(200, 119, 46, 0.2);
    }
    .tl-entry:hover .tl-dot--range {
      transform: rotate(45deg) scale(1.4);
      box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.2);
    }

    /* ── Info block ── */
    .tl-info {
      display: flex; flex-direction: column; gap: 0.1rem;
      min-width: 0;
    }
    .tl-info__ent-tipo {
      font-size: 0.6rem; color: #8f9080; text-transform: uppercase;
      letter-spacing: 0.08em; line-height: 1.2;
    }
    .tl-info__ent-nombre {
      font-size: 0.82rem; font-weight: 600; color: #2f3d35;
      line-height: 1.3; margin-bottom: 1px;
    }
    .tl-info__evento {
      font-size: 0.78rem; font-weight: 600; color: var(--simr-tinta);
      line-height: 1.3;
    }
    .tl-info__lugar {
      display: inline-flex; align-items: center; gap: 0.15rem;
      font-size: 0.7rem; color: var(--simr-tinta-2);
    }
    .tl-info__lugar mat-icon {
      font-size: 12px; width: 12px; height: 12px;
    }
    .tl-info__cobertura {
      font-size: 0.68rem; color: var(--simr-musgo); font-style: italic;
    }
    .tl-info__fecha {
      font-size: 0.68rem; color: var(--simr-tinta-2); opacity: 0.7;
    }
  `],
})
export class AnotacionTimelineComponent {
  readonly anotaciones = input.required<AnotacionCartograficoTemporal[]>();
  readonly edit = output<number>();

  protected searchTerm = '';
  protected groupEventValue: string = NgxTimelineEventGroup.YEAR;
  protected readonly NgxTimelineEventChangeSide = NgxTimelineEventChangeSide;

  protected currentGroupEvent = computed(() => this.groupEventValue as NgxTimelineEventGroup);

  protected filteredEvents = computed(() => {
    const events = this.buildEvents(this.anotaciones());
    if (!this.searchTerm.trim()) return events;
    const term = this.searchTerm.toLowerCase();
    return events.filter((e) => {
      const a = this.findAnotacion(e);
      if (!a) return false;
      const haystack = [a.evento, a.lugar, a.coberturaAmplitud, a.evidencia]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  });

  private buildEvents(anotaciones: AnotacionCartograficoTemporal[]): NgxTimelineEvent[] {
    return anotaciones
      .map((a, index) => {
        const date = this.parseFecha(a.fechaInicio);
        if (!date) return null;
        return {
          timestamp: date,
          title: a.evento || a.lugar || 'Sin evento',
          description: this.buildDateDescription(a),
          id: index,
        } as NgxTimelineEvent;
      })
      .filter((e): e is NgxTimelineEvent => e !== null)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private parseFecha(fecha?: string): Date | null {
    if (!fecha) return null;
    let date: Date | null = null;
    if (fecha.includes('-')) {
      const d = new Date(fecha);
      date = isNaN(d.getTime()) ? null : d;
    } else if (fecha.includes('/')) {
      const parts = fecha.split('/');
      const y = parseInt(parts[0], 10) || 2000;
      const m = parseInt(parts[1], 10) || 1;
      const d = parseInt(parts[2], 10) || 1;
      date = new Date(y, m - 1, d);
    }
    if (!date) return null;
    // Force to midnight so ngx-timeline never shows a time
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private buildDateDescription(a: AnotacionCartograficoTemporal): string {
    const parts: string[] = [];
    if (a.fechaInicio) {
      const f = toDisplayFecha(a.fechaInicio);
      const [y, m, d] = f.split('/');
      parts.push(`Inicio: ${formatDate(y, m, d, a.precisionInicio || 'AMD')}`);
    }
    if (a.fechaFin) {
      const f = toDisplayFecha(a.fechaFin);
      const [y, m, d] = f.split('/');
      parts.push(`Fin: ${formatDate(y, m, d, a.precisionFin || 'AMD')}`);
    }
    return parts.join(' — ') || 'Sin fecha';
  }

  private findAnotacion(source: any): AnotacionCartograficoTemporal | null {
    const idx = (source?.eventInfo?.id ?? source?.id) as number;
    const list = this.anotaciones();
    return idx != null && idx < list.length ? list[idx] : null;
  }

  protected isRange(item: NgxTimelineItem): boolean {
    const a = this.findAnotacion(item);
    return !!(a?.fechaInicio && a?.fechaFin);
  }

  protected getEntidadLabel(item: NgxTimelineItem): string {
    const a: any = this.findAnotacion(item);
    return a?.entidadLabel || a?.entidadKey || '';
  }

  protected getEntidadNombre(item: NgxTimelineItem): string {
    const a: any = this.findAnotacion(item);
    return a?.entidadNombre || '';
  }

  protected getEvento(item: NgxTimelineItem): string {
    return this.findAnotacion(item)?.evento || '';
  }

  protected getLugar(item: NgxTimelineItem): string {
    return this.findAnotacion(item)?.lugar || '';
  }

  protected getCobertura(item: NgxTimelineItem): string {
    return this.findAnotacion(item)?.coberturaAmplitud || '';
  }

  protected onTimelineClick(item: NgxTimelineItem) {
    const idx = item.eventInfo?.id as number;
    if (idx != null) this.edit.emit(idx);
  }

  protected onEntryClick(item: NgxTimelineItem) {
    const idx = item.eventInfo?.id as number;
    if (idx != null) this.edit.emit(idx);
  }
}
