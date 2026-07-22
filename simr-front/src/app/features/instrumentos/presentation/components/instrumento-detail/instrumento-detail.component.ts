import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { HsCodeSegment } from '../../../../../shared/hs-classification/hs-classification.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { InstrumentosStore } from '../../../state/instrumentos.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { HsClassificationService } from '../../../../../shared/hs-classification/hs-classification.service';

@Component({
  selector: 'app-instrumento-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
    AnotacionesCartograficasComponent,
  ],
  providers: [InstrumentosStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedInstrumento(); as m) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(m._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(m._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del instrumento…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedInstrumento(); as m) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>music_note</mat-icon>
              <h1>{{ m.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ m._id }}</span>
          </div>

          @if (m.clasificacion) {
            <app-collapsible-section title="Clasificación Hornbostel-Sachs" icon="account_tree">
              <div class="hs-with-popup">
                <div class="hs-code">{{ m.clasificacion }}</div>
                @if (hsNodeName(); as name) {
                  <div class="hs-name">{{ name }}</div>
                }
                <div class="hs-popup">
                  <div class="popup-title">Desglose de {{ m.clasificacion }}</div>
                  @for (seg of hsBreakdown(); track $index) {
                    <div class="seg-row" [class.suffix]="seg.isSuffix">
                      <span class="seg-code">{{ seg.code }}</span>
                      <span class="seg-arrow">→</span>
                      <span class="seg-name">{{ seg.name }}</span>
                    </div>
                  }
                </div>
              </div>
            </app-collapsible-section>
          }

          @if (m.alias && m.alias.length > 0) {
            <app-collapsible-section title="Alias" icon="alternate_email">
              <div class="chips-wrapper">
                @for (a of m.alias; track $index) {
                  <span class="detalle-chip">{{ a.nombre || a }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.proyectosAsociados && m.proyectosAsociados.length > 0) {
            <app-collapsible-section title="Proyectos asociados" icon="assignment">
              <div class="kv-list">
                @for (p of m.proyectosAsociados; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getProyNombre(p) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.anotacionCartograficoTemporal && m.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map">
              <app-anotaciones-cartograficas
                [anotaciones]="m.anotacionCartograficoTemporal"
                [readonly]="true"
              />
            </app-collapsible-section>
          }

          @if (m.descriptorLibre && m.descriptorLibre.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label">
              <div class="kv-list">
                @for (d of m.descriptorLibre; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.vinculoRelacionado && m.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="link">
              <div class="kv-list">
                @for (v of m.vinculoRelacionado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ v.etiqueta }}</span>
                    <a class="kv-value" [href]="v.url" target="_blank" rel="noopener">{{ v.url }}</a>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos" icon="attach_file">
            <app-archivo-manager
              [documentId]="m._id"
              collection="instrumentos"
            />
          </app-collapsible-section>

          @if (m.creador) {
            <div class="creador-info">
              <mat-icon>person</mat-icon>
              <span>
                Creado por <strong>{{ getCreatorName(m.creador) }}</strong>
                el {{ m.creado | date:'dd/MM/yyyy' }}
              </span>
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .volver { color: var(--simr-musgo); }
    .header-actions { display: flex; gap: 0.75rem; }
    .cargando { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 4rem 0; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .ficha { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { padding: 2rem 2rem 1rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .ficha-cabecera .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .ficha-cabecera .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 1.35rem; }
    .ficha-cabecera .titulo mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--simr-cobre); }
    .hs-with-popup { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; position: relative; cursor: help; }
    .hs-code { font-family: 'IBM Plex Mono', monospace; font-size: 1.4rem; font-weight: 700; color: var(--simr-musgo); }
    .hs-name { font-size: 0.9rem; color: var(--simr-tinta-2); }
    .hs-popup { display: none; position: absolute; top: calc(100% + 6px); left: 0; z-index: 100; background: var(--simr-tinta); color: var(--simr-papel); border-radius: 10px; padding: 0.75rem 1rem; min-width: 300px; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
    .hs-with-popup:hover .hs-popup { display: block; }
    .popup-title { font-size: 0.78rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.15); color: var(--simr-cobre); }
    .seg-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.82rem; }
    .seg-row.suffix { border-top: 1px solid rgba(255,255,255,0.12); margin-top: 0.25rem; padding-top: 0.4rem; }
    .seg-code { font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: var(--simr-cobre); min-width: 70px; }
    .seg-arrow { color: rgba(255,255,255,0.3); }
    .seg-name { color: var(--simr-papel); flex: 1; }
    .chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.5rem 0; }
    .detalle-chip { background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline); border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; justify-content: space-between; gap: 1rem; padding: 0.4rem 0; border-bottom: 1px solid var(--mat-sys-outline); }
    .kv-item:last-child { border-bottom: none; }
    .kv-key { font-weight: 600; font-size: 0.88rem; color: var(--simr-tinta); }
    .kv-value { font-size: 0.88rem; color: var(--simr-tinta-2); word-break: break-all; }
    .creador-info { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; border-top: 1px solid var(--mat-sys-outline); font-size: 0.82rem; color: var(--simr-tinta-2); }
    .creador-info mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class InstrumentoDetailComponent implements OnInit {
  protected readonly store = inject(InstrumentosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly hsService = inject(HsClassificationService);

  protected instrumentoId: string | null = null;
  private proyectosCache: any[] = [];
  protected hsNodeName = signal<string | null>(null);
  protected hsBreakdown = signal<HsCodeSegment[]>([]);
  protected popupHover = signal(false); // unused, CSS handles the hover

  constructor() {
    effect(() => {
      const m = this.store.selectedInstrumento();
      if (m?.clasificacion) {
        const baseCode = m.clasificacion.split('-')[0];
        const node = this.hsService.getNode(baseCode);
        this.hsNodeName.set(node ? this.hsService.getSpanishName(baseCode) : null);
        this.hsBreakdown.set(this.hsService.getCodeBreakdown(m.clasificacion));
      }
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/proyectos`).subscribe({
      next: (data: any) => this.proyectosCache = Array.isArray(data) ? data : data?.data || [],
      error: () => this.proyectosCache = [],
    });
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.instrumentoId = id;
        this.store.setInitialState();
        this.store.loadInstrumentoById(id);
        await this.hsService.load();
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (typeof creador === 'object' && creador.fullName) return creador.fullName;
    if (typeof creador === 'object' && (creador.firstName || creador.lastName)) {
      return [creador.firstName, creador.lastName].filter(Boolean).join(' ');
    }
    return String(creador);
  }

  protected getProyNombre(proy: any): string {
    const ref = proy?.proyecto || proy;
    if (!ref) return '—';
    if (typeof ref === 'object' && ref.nombre) return ref.nombre;
    if (typeof ref === 'string') {
      const found = this.proyectosCache.find((p: any) => p._id === ref);
      return found?.nombre || '(sin nombre)';
    }
    return '(sin nombre)';
  }

  navigateToEdit(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/instrumentos/edit', id]);
  }

  confirmDelete(id: string) {
    const inst = this.store.selectedInstrumento();
    const name = inst?.nombre || 'este instrumento';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar instrumento', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) this.store.deleteInstrumento(id);
    });
  }

  goBack() {
    this.router.navigate(['/instrumentos']);
  }
}
