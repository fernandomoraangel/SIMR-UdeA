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
import { GenerosNoMusicalesStore } from '../../../state/generos-no-musicales.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';

@Component({
  selector: 'app-genero-no-musical-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
    AnotacionesCartograficasComponent,
  ],
  providers: [GenerosNoMusicalesStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedGenero(); as g) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(g._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(g._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del género no musical…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedGenero(); as g) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>category</mat-icon>
              <h1>{{ g.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ g._id }}</span>
          </div>

          @if (g.descripcion) {
            <app-collapsible-section title="Descripción" icon="description">
              <p class="desc-text">{{ g.descripcion }}</p>
            </app-collapsible-section>
          }

          @if (g.alias && g.alias.length > 0) {
            <app-collapsible-section title="Alias" icon="alternate_email">
              <div class="chips-wrapper">
                @for (a of g.alias; track $index) {
                  <span class="detalle-chip">{{ a.nombre || a }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.generosRelacionados && g.generosRelacionados.length > 0) {
            <app-collapsible-section title="Géneros relacionados" icon="shuffle">
              <div class="kv-list">
                @for (rel of g.generosRelacionados; track $index) {
                  <div class="kv-item clickable" (click)="navigateToGenero(rel.id)">
                    <span class="kv-value">{{ getGeneroNombre(rel.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.padres && g.padres.length > 0) {
            <app-collapsible-section title="Géneros padres" icon="arrow_upward">
              <div class="kv-list">
                @for (p of g.padres; track $index) {
                  <div class="kv-item clickable" (click)="navigateToGenero(p.id)">
                    <span class="kv-value">{{ getGeneroNombre(p.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.hijos && g.hijos.length > 0) {
            <app-collapsible-section title="Géneros hijos" icon="arrow_downward">
              <div class="kv-list">
                @for (h of g.hijos; track $index) {
                  <div class="kv-item clickable" (click)="navigateToGenero(h.id)">
                    <span class="kv-value">{{ getGeneroNombre(h.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.idioma && g.idioma.length > 0) {
            <app-collapsible-section title="Idiomas" icon="translate">
              <div class="chips-wrapper">
                @for (i of g.idioma; track $index) {
                  <span class="detalle-chip">{{ getIdiomaNombre(i) }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.anotacionCartograficoTemporal && g.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map">
              <app-anotaciones-cartograficas
                [anotaciones]="g.anotacionCartograficoTemporal"
                [lugares]="[]"
                [coberturas]="[]"
                [readonly]="true"
              />
            </app-collapsible-section>
          }

          @if (g.descriptorLibre && g.descriptorLibre.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label">
              <div class="kv-list">
                @for (d of g.descriptorLibre; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (g.vinculoRelacionado && g.vinculoRelacionado.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of g.vinculoRelacionado; track $index) {
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
              collection="generos-no-musicales"
              [documentId]="g._id"
              [readonly]="true"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(g.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ g.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Género no musical no encontrado.</p>
            <button mat-stroked-button routerLink="/generos-no-musicales">Volver al listado</button>
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
    .desc-text { padding: 0.5rem 0; line-height: 1.6; color: var(--simr-tinta-2); }
    .chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .detalle-chip { background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
    .kv-item.clickable { cursor: pointer; transition: border-color 0.2s; }
    .kv-item.clickable:hover { border-color: var(--simr-cobre); }
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
export class GeneroNoMusicalDetailComponent implements OnInit {
  protected readonly store = inject(GenerosNoMusicalesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected generoId: string | null = null;
  private allGenerosCache: any[] = [];

  protected readonly genero = this.store.selectedGenero;

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/generos-no-musicales`).subscribe({
      next: (res) => this.allGenerosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.allGenerosCache = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.generoId = id;
        this.store.setInitialState();
        this.store.loadById(id);
      }
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  protected getGeneroNombre(ref: string): string {
    if (!ref) return '';
    const found = this.allGenerosCache.find((g) => g._id === ref);
    return found?.nombre || '(cargando…)';
  }

  protected getIdiomaNombre(item: any): string {
    if (!item) return '';
    if (typeof item === 'object' && item.idioma) return item.idioma;
    if (typeof item === 'object' && item._id) return item._id;
    return String(item);
  }

  protected navigateToGenero(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/generos-no-musicales', id]);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/generos-no-musicales/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedGenero()?.nombre || 'este género';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar género no musical', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.delete(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/generos-no-musicales']);
  }
}
