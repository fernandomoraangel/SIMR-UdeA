import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { ObrasStore } from '../../../data/obras.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatDialogModule,
    CollapsibleSectionComponent,
    ArchivoManagerComponent,
    AnotacionesCartograficasComponent,
  ],
  providers: [ObrasStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedObra(); as o) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(o._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(o._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles de la obra…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedObra(); as o) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>music_note</mat-icon>
              <h1>{{ o.titulo }}</h1>
            </div>
            <span class="simr-codigo">ID {{ o._id }}</span>
          </div>

          @if (o.tipo) {
            <section class="seccion">
              <p class="campo-label">Tipo</p>
              <p class="campo-valor">{{ o.tipo }}</p>
            </section>
          }

          @if (o.descripcion) {
            <app-collapsible-section title="Descripción" icon="description">
              <p class="desc-text">{{ o.descripcion }}</p>
            </app-collapsible-section>
          }

          @if (o.denominacionRegional && o.denominacionRegional.length > 0) {
            <app-collapsible-section title="Denominaciones regionales" icon="language">
              <div class="kv-list">
                @for (d of o.denominacionRegional; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.denominacionRegional }}</span>
                    <span class="kv-value">{{ d.fuenteDenominacion }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.contenedores && o.contenedores.length > 0) {
            <app-collapsible-section title="Contenedores (obras)" icon="folder_open">
              <div class="kv-list">
                @for (c of o.contenedores; track $index) {
                  <div class="kv-item clickable" (click)="navigateToObra(c.id)">
                    <span class="kv-value">{{ getObraNombre(c.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.actores && o.actores.length > 0) {
            <app-collapsible-section title="Actores relacionados" icon="people">
              <div class="kv-list">
                @for (a of o.actores; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getActorNombre(a.id) }}</span>
                    <span class="kv-value">{{ a.rol }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.generosFormas && o.generosFormas.length > 0) {
            <app-collapsible-section title="Géneros-formas musicales" icon="music_note">
              <div class="kv-list">
                @for (g of o.generosFormas; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getGeneroNombre(g.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.GenerosFormasNoMusicales && o.GenerosFormasNoMusicales.length > 0) {
            <app-collapsible-section title="Géneros-formas no musicales" icon="theater_comedy">
              <div class="kv-list">
                @for (g of o.GenerosFormasNoMusicales; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getGeneroNoMusicalNombre(g.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.materias && o.materias.length > 0) {
            <app-collapsible-section title="Materias" icon="book">
              <div class="kv-list">
                @for (m of o.materias; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getMateriaNombre(m.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.mediosSonoros && o.mediosSonoros.length > 0) {
            <app-collapsible-section title="Medios sonoros-formatos asociados" icon="speaker">
              <div class="kv-list">
                @for (m of o.mediosSonoros; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getMedioNombre(m.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.sistemasSonoros && o.sistemasSonoros.length > 0) {
            <app-collapsible-section title="Sistemas sonoros asociados" icon="tune">
              <div class="kv-list">
                @for (s of o.sistemasSonoros; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getSistemaNombre(s.id) }}</span>
                    <span class="kv-value">{{ s.centro ? 'Centro: ' + s.centro : '' }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.idiomas && o.idiomas.length > 0) {
            <app-collapsible-section title="Idiomas asociados" icon="language">
              <div class="kv-list">
                @for (i of o.idiomas; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getIdiomaNombre(i.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.asientoLigado && o.asientoLigado.length > 0) {
            <app-collapsible-section title="Asientos ligados" icon="link">
              <div class="kv-list">
                @for (a of o.asientoLigado; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ getObraNombre(a.id) }}</span>
                    <span class="kv-value">{{ a.tipoDeRelacion }} — {{ a.direccionDeRelacion }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.anotacionCartograficoTemporal && o.anotacionCartograficoTemporal.length > 0) {
            <app-collapsible-section title="Anotaciones cartográfico temporales" icon="map">
              <app-anotaciones-cartograficas
                [anotaciones]="o.anotacionCartograficoTemporal"
                [lugares]="[]"
                [coberturas]="[]"
                [readonly]="true"
              />
            </app-collapsible-section>
          }

          @if (o.descriptores && o.descriptores.length > 0) {
            <app-collapsible-section title="Descriptores libres" icon="label">
              <div class="kv-list">
                @for (d of o.descriptores; track $index) {
                  <div class="kv-item">
                    <span class="kv-key">{{ d.etiqueta }}</span>
                    <span class="kv-value">{{ d.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.proyectos && o.proyectos.length > 0) {
            <app-collapsible-section title="Proyectos asociados" icon="assignment">
              <div class="kv-list">
                @for (p of o.proyectos; track $index) {
                  <div class="kv-item">
                    <span class="kv-value">{{ getProyNombre(p.id) }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          @if (o.vinculosRelacionados && o.vinculosRelacionados.length > 0) {
            <app-collapsible-section title="Vínculos relacionados" icon="language">
              <div class="kv-list">
                @for (v of o.vinculosRelacionados; track $index) {
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
              collection="obras"
              [documentId]="o._id"
              [readonly]="true"
            />
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(o.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ o.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Obra no encontrada.</p>
            <button mat-stroked-button routerLink="/obras">Volver al listado</button>
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
    .seccion { padding: 1.5rem 2rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .seccion:last-child { border-bottom: none; }
    .seccion h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-family: var(--simr-body); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--simr-sello); }
    .seccion h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--simr-sello); }
    .campo-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--simr-tinta-2); margin: 0 0 0.25rem; }
    .campo-valor { font-size: 1.1rem; color: var(--simr-tinta); margin: 0; }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
    .kv-item.clickable { cursor: pointer; transition: border-color 0.2s; }
    .kv-item.clickable:hover { border-color: var(--simr-cobre); }
    .kv-key { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 120px; padding: 0.15rem 0.5rem; background: var(--simr-hueso); border-radius: 4px; text-align: center; }
    .kv-value { flex: 1; font-size: 0.9rem; color: var(--simr-tinta-2); }
    .kv-link { color: var(--simr-musgo); text-decoration: none; }
    .kv-link:hover { text-decoration: underline; color: var(--simr-cobre); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--simr-tinta-2); }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
  `],
})
export class ObraDetailComponent implements OnInit {
  protected readonly store = inject(ObrasStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected obraId: string | null = null;
  private obrasCache: any[] = [];
  private actoresCache: any[] = [];
  private generosCache: any[] = [];
  private generosNoMusicalesCache: any[] = [];
  private materiasCache: any[] = [];
  private mediosCache: any[] = [];
  private sistemasCache: any[] = [];
  private idiomasCache: any[] = [];
  private proyectosCache: any[] = [];

  protected readonly obra = this.store.selectedObra;

  ngOnInit() {
    const apiUrl = environment.apiUrl;
    this.http.get<any>(`${apiUrl}/obras`).subscribe({
      next: (res) => this.obrasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.obrasCache = [],
    });
    this.http.get<any>(`${apiUrl}/actores`).subscribe({
      next: (res) => this.actoresCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.actoresCache = [],
    });
    this.http.get<any>(`${apiUrl}/generos`).subscribe({
      next: (res) => this.generosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.generosCache = [],
    });
    this.http.get<any>(`${apiUrl}/generosnomusicales`).subscribe({
      next: (res) => this.generosNoMusicalesCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.generosNoMusicalesCache = [],
    });
    this.http.get<any>(`${apiUrl}/materias`).subscribe({
      next: (res) => this.materiasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.materiasCache = [],
    });
    this.http.get<any>(`${apiUrl}/medios`).subscribe({
      next: (res) => this.mediosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.mediosCache = [],
    });
    this.http.get<any>(`${apiUrl}/sistemas`).subscribe({
      next: (res) => this.sistemasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.sistemasCache = [],
    });
    this.http.get<any>(`${apiUrl}/idiomas`).subscribe({
      next: (res) => this.idiomasCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.idiomasCache = [],
    });
    this.http.get<any>(`${apiUrl}/proyectos`).subscribe({
      next: (res) => this.proyectosCache = Array.isArray(res) ? res : res?.data || [],
      error: () => this.proyectosCache = [],
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.obraId = id;
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

  protected getObraNombre(ref: string): string {
    if (!ref) return '';
    const found = this.obrasCache.find((o) => o._id === ref);
    return found?.titulo || '(cargando...)';
  }

  protected getActorNombre(ref: string): string {
    if (!ref) return '';
    const found = this.actoresCache.find((a) => a._id === ref);
    return found?.fullName || '(cargando...)';
  }

  protected getGeneroNombre(ref: string): string {
    if (!ref) return '';
    const found = this.generosCache.find((g) => g._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected getGeneroNoMusicalNombre(ref: string): string {
    if (!ref) return '';
    const found = this.generosNoMusicalesCache.find((g) => g._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected getMateriaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.materiasCache.find((m) => m._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected getMedioNombre(ref: string): string {
    if (!ref) return '';
    const found = this.mediosCache.find((m) => m._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected getSistemaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.sistemasCache.find((s) => s._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected getIdiomaNombre(ref: string): string {
    if (!ref) return '';
    const found = this.idiomasCache.find((i) => i._id === ref);
    return found?.idioma || found?.nombre || '(cargando...)';
  }

  protected getProyNombre(ref: any): string {
    if (!ref) return '';
    if (typeof ref === 'object') {
      if (ref.nombre) return ref.nombre;
      if (ref._id) ref = ref._id;
      else return JSON.stringify(ref);
    }
    const found = this.proyectosCache.find((p) => p._id === ref);
    return found?.nombre || '(cargando...)';
  }

  protected navigateToObra(id: string) {
    this.store.setInitialState();
    this.router.navigate(['/obras', id]);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/obras/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedObra()?.titulo || 'esta obra';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar obra', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
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
    this.router.navigate(['/obras']);
  }
}
