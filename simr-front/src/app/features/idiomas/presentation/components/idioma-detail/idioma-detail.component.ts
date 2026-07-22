import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IdiomasStore } from '../../../state/idiomas.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-idioma-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
    AnotacionesCartograficasComponent,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedIdioma(); as m) {
          <h1>{{ m.idioma }}</h1>
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
          <span>Cargando detalles del idioma…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedIdioma(); as m) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>translate</mat-icon>
              <div>
                <h1>{{ m.idioma }}</h1>
                @if (m.endonym) {
                  <span class="endonym">{{ m.endonym }}</span>
                }
              </div>
            </div>
            <span class="simr-codigo">ID {{ m._id }}</span>
          </div>

          <app-collapsible-section title="Clasificación lingüística" icon="category">
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Familia lingüística</label>
                  <span>{{ m.linguisticFamily || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Modo de transmisión</label>
                  <span>{{ m.transmissionMode || '—' }}</span>
                </div>
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Códigos y estándares" icon="code">
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Glottocode</label>
                  <code>{{ m.glottocode || '—' }}</code>
                </div>
                <div class="info-item">
                  <label>ISO 639-3</label>
                  <code>{{ m.isoCode || '—' }}</code>
                </div>
              </div>
            </div>
          </app-collapsible-section>

          @if (m.territorialContext) {
            <app-collapsible-section title="Contexto territorial" icon="map" [collapsed]="false">
              <div class="section-content">
                <p>{{ m.territorialContext }}</p>
              </div>
            </app-collapsible-section>
          }

          @if (m.anotacionCartograficoTemporal && m.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico-temporales" icon="map" [collapsed]="true">
              <div class="section-content">
                <app-anotaciones-cartograficas [anotaciones]="m.anotacionCartograficoTemporal" [readonly]="true" />
              </div>
            </app-collapsible-section>
          }

          @if (m.descriptorLibre && m.descriptorLibre.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label" [collapsed]="true">
              <div class="section-content">
                <div class="items-list">
                  @for (d of m.descriptorLibre; track $index) {
                    <div class="descriptor-item">
                      <span class="descriptor-etiqueta">{{ d.etiqueta }}</span>
                      <span class="descriptor-contenido">{{ d.contenido }}</span>
                    </div>
                  }
                </div>
              </div>
            </app-collapsible-section>
          }

          @if (m.vinculoRelacionado && m.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Enlaces" icon="link" [collapsed]="true">
              <div class="section-content">
                <div class="items-list">
                  @for (v of m.vinculoRelacionado; track $index) {
                    <div class="vinculo-item">
                      <span class="vinculo-etiqueta">{{ v.etiqueta }}</span>
                      <a [href]="v.url" target="_blank" class="vinculo-url">{{ v.url }}</a>
                    </div>
                  }
                </div>
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Archivos adjuntos" icon="attach_file" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="m._id"
                collection="idiomas"
                [readonly]="true"
              />
            </div>
          </app-collapsible-section>

          @if (m.creador) {
            <div class="footer-meta">
              <span>Creado por {{ getCreatorName(m.creador) }} el {{ m.creado | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          }
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Idioma no encontrado.</p>
            <button mat-stroked-button routerLink="/idiomas">Volver al listado</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
    .detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .detail-header h1 { margin: 0; flex: 1; font-family: var(--simr-display); font-weight: 600; }
    .volver { color: var(--simr-musgo); }
    .header-actions { display: flex; gap: 0.75rem; }
    .cargando { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .ficha { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { background: var(--simr-tinta); color: var(--simr-hueso); padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .titulo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--simr-cobre); }
    .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 2rem; color: var(--simr-hueso); }
    .endonym { font-size: 0.9rem; color: rgba(251, 249, 244, 0.7); font-style: italic; display: block; margin-top: 0.15rem; }
    .ficha-cabecera .simr-codigo { color: rgba(251, 249, 244, 0.5); }
    .section-content { padding: 0.5rem 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .info-item code { font-family: var(--simr-mono); color: var(--simr-musgo); font-size: 0.95rem; background: rgba(31,42,36,0.06); padding: 0.1rem 0.4rem; border-radius: 4px; }
    .section-content p { margin: 0; color: var(--simr-tinta); line-height: 1.6; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .descriptor-item {
      display: flex; align-items: flex-start; gap: 0.75rem;
      background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline);
      border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .descriptor-etiqueta { font-weight: 600; font-size: 0.85rem; color: var(--simr-musgo); min-width: 100px; }
    .descriptor-contenido { flex: 1; font-size: 0.9rem; color: var(--simr-tinta); }
    .vinculo-item {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--simr-hueso); border: 1px solid var(--mat-sys-outline);
      border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .vinculo-etiqueta { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 100px; }
    .vinculo-url { font-size: 0.85rem; color: var(--simr-cobre); word-break: break-all; }
    .footer-meta { padding: 1rem 2rem; border-top: 1px solid var(--mat-sys-outline); color: var(--simr-tinta-2); font-size: 0.82rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
  `],
})
export class IdiomaDetailComponent implements OnInit {
  protected readonly store = inject(IdiomasStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected idiomaId: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.idiomaId = id;
        this.store.setInitialState();
        this.store.loadIdiomaById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/idiomas/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedIdioma()?.idioma || 'este idioma';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar idioma',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.deleteIdioma(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/idiomas']);
  }
}
