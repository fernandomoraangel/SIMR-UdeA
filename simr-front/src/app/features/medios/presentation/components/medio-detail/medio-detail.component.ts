import { Component, OnInit, inject } from '@angular/core';
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
import { MediosStore } from '../../../state/medios.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';

@Component({
  selector: 'app-medio-detail',
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
  providers: [MediosStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedMedio(); as m) {
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
          <span>Cargando detalles del medio sonoro…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedMedio(); as m) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>audiotrack</mat-icon>
              <h1>{{ m.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ m._id }}</span>
          </div>

          @if (m.alias && m.alias.length > 0) {
            <app-collapsible-section title="Alias" icon="alternate_email">
              <div class="chips-wrapper">
                @for (a of m.alias; track $index) {
                  <span class="detalle-chip">{{ a.nombre || a }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.instrumentos && m.instrumentos.length > 0) {
            <app-collapsible-section title="Instrumentos" icon="music_note">
              <div class="kv-list">
                @for (inst of m.instrumentos; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getInstNombre(inst.instrumento) }}</span>
                    <span class="kv-value">× {{ inst.cantidad }} — {{ inst.rol }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.proyectosAsociados && m.proyectosAsociados.length > 0) {
            <app-collapsible-section title="Proyectos asociados" icon="assignment">
              <div class="kv-list">
                @for (p of m.proyectosAsociados; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getProyNombre(p.proyecto) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (m.anotacionCartograficoTemporal && m.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map">
              <app-anotaciones-cartograficas
                [anotaciones]="m.anotacionCartograficoTemporal"
                [lugares]="[]"
                [coberturas]="[]"
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
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of m.vinculoRelacionado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ v.etiqueta }}</span>
                    <a class="kv-value kv-link" [href]="v.url" target="_blank" rel="noopener">{{ v.url }}</a>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <app-archivo-manager
              collection="medios"
              [documentId]="m._id"
              [readonly]="true"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(m.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ m.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Medio sonoro no encontrado.</p>
            <button mat-stroked-button routerLink="/medios">Volver al listado</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .volver { color: var(--simr-musgo); }
    .header-actions { display: flex; gap: 0.75rem; }
    .cargando { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .ficha { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { background: var(--simr-tinta); color: var(--simr-hueso); padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .titulo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--simr-cobre); }
    .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 2rem; color: var(--simr-hueso); }
    .ficha-cabecera .simr-codigo { color: rgba(251, 249, 244, 0.7); }
    .chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .detalle-chip { background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
    .kv-key { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 120px; padding: 0.15rem 0.5rem; background: var(--simr-hueso); border-radius: 4px; text-align: center; }
    .kv-value { flex: 1; font-size: 0.9rem; color: var(--simr-tinta-2); }
    .kv-link { color: var(--simr-musgo); text-decoration: none; }
    .kv-link:hover { text-decoration: underline; color: var(--simr-cobre); }
    .seccion { padding: 1.5rem 2rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .seccion:last-child { border-bottom: none; }
    .seccion h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-family: var(--simr-body); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--simr-sello); }
    .seccion h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--simr-sello); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
  `],
})
export class MedioDetailComponent implements OnInit {
  protected readonly store = inject(MediosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected medioId: string | null = null;
  private instrumentos: any[] = [];
  private proyectos: any[] = [];

  protected readonly medio = this.store.selectedMedio;

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/instrumentos`).subscribe({
      next: (res) => this.instrumentos = Array.isArray(res) ? res : res?.data || [],
      error: () => this.instrumentos = [],
    });
    this.http.get<any>(`${environment.apiUrl}/proyectos`).subscribe({
      next: (res) => this.proyectos = Array.isArray(res) ? res : res?.data || [],
      error: () => this.proyectos = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.medioId = id;
        this.store.setInitialState();
        this.store.loadMedioById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  protected getInstNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const inst = this.instrumentos.find((i) => i._id === ref);
    return inst?.nombre || '(cargando…)';
  }

  protected getProyNombre(proy: any): string {
    if (!proy) return '';
    if (typeof proy === 'object') {
      if (proy.nombre) return proy.nombre;
      if (proy._id) proy = proy._id;
      else return JSON.stringify(proy);
    }
    const found = this.proyectos.find((p) => p._id === proy);
    return found?.nombre || '(cargando…)';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/medios/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedMedio()?.nombre || 'este medio';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar medio sonoro',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.deleteMedio(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/medios']);
  }
}
