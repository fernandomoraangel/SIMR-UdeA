import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MateriasStore } from '../../../state/materias.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-materia-detail',
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
  ],
  providers: [MateriasStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedMateria(); as m) {
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
          <span>Cargando detalles de la materia…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedMateria(); as m) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>bookmark</mat-icon>
              <h1>{{ m.nombre }}</h1>
            </div>
            <span class="simr-codigo">ID {{ m._id }}</span>
          </div>

          @if (m.descripcion) {
            <section class="seccion">
              <h3><mat-icon>description</mat-icon> Descripción</h3>
              <p class="descripcion-texto">{{ m.descripcion }}</p>
            </section>
          }

          <app-collapsible-section title="Alias" icon="alt_route">
            @if (m.alias && m.alias.length > 0) {
              <div class="chips-wrapper">
                @for (a of m.alias; track $index) {
                  <span class="detalle-chip">{{ a.nombre }}</span>
                }
              </div>
            } @else {
              <p class="sin-datos">Sin alias registrados.</p>
            }
          </app-collapsible-section>

          @if (m.materiasRelacionadas && m.materiasRelacionadas.length > 0) {
            <app-collapsible-section title="Materias relacionadas" icon="link">
              <div class="chips-wrapper">
                @for (r of m.materiasRelacionadas; track $index) {
                  <span class="detalle-chip detalle-chip--link">{{ getNombre(r) }}</span>
                }
              </div>
            </app-collapsible-section>
          }

          <app-collapsible-section title="Jerarquía" icon="account_tree">
            @if (m.padres && m.padres.length > 0) {
              <div class="jerarquia-section">
                <h4 class="jerarquia-label">Padres</h4>
                <div class="chips-wrapper">
                  @for (p of m.padres; track $index) {
                    <span class="detalle-chip detalle-chip--padre">{{ getNombre(p) }}</span>
                  }
                </div>
              </div>
            }
            @if (m.hijos && m.hijos.length > 0) {
              <div class="jerarquia-section">
                <h4 class="jerarquia-label">Hijos</h4>
                <div class="chips-wrapper">
                  @for (h of m.hijos; track $index) {
                    <span class="detalle-chip detalle-chip--hijo">{{ getNombre(h) }}</span>
                  }
                </div>
              </div>
            }
            @if ((!m.padres || m.padres.length === 0) && (!m.hijos || m.hijos.length === 0)) {
              <p class="sin-datos">Sin jerarquía definida.</p>
            }
          </app-collapsible-section>

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
              collection="materias"
              [documentId]="m._id"
              [readonly]="true"
              [initialFiles]="$any(m.archivosAdjuntos)"
            ></app-archivo-manager>
          </app-collapsible-section>

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ (m.creador)?.fullName || '—' }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ m.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-actions { display: flex; gap: 0.75rem; }
    .ficha { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .ficha-cabecera { background: var(--simr-tinta); color: var(--simr-hueso); padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .titulo { display: flex; align-items: center; gap: 0.75rem; }
    .titulo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--simr-cobre); }
    .titulo h1 { margin: 0; font-family: var(--simr-display); font-weight: 600; font-size: 2rem; color: var(--simr-hueso); }
    .ficha-cabecera .simr-codigo { color: rgba(251, 249, 244, 0.7); }
    .seccion { padding: 1.5rem 2rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .seccion:last-child { border-bottom: none; }
    .seccion h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-family: var(--simr-body); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--simr-sello); }
    .seccion h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--simr-sello); }
    .descripcion-texto { line-height: 1.7; color: var(--simr-tinta-2); margin: 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .info-item { background: var(--simr-papel); padding: 1rem 1.25rem; border-radius: 10px; border-left: 3px solid var(--simr-cobre); }
    .info-item label { display: block; font-weight: 600; color: var(--simr-tinta-2); font-size: 0.8rem; margin-bottom: 0.25rem; }
    .info-item span { color: var(--simr-tinta); font-size: 1rem; }
    .cargando { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .detalle-chip { background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.85rem; color: var(--simr-tinta); }
    .detalle-chip--link { border-color: var(--simr-musgo); }
    .detalle-chip--padre { border-color: var(--simr-cobre); }
    .detalle-chip--hijo { border-color: var(--simr-sello); }
    .jerarquia-section { margin-bottom: 0.75rem; }
    .jerarquia-section:last-child { margin-bottom: 0; }
    .jerarquia-label { margin: 0 0 0.4rem; font-size: 0.78rem; font-weight: 600; color: var(--simr-tinta-2); text-transform: uppercase; letter-spacing: 0.05em; }
    .kv-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .kv-item { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.6rem 0.75rem; }
    .kv-key { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 120px; padding: 0.15rem 0.5rem; background: var(--simr-hueso); border-radius: 4px; text-align: center; }
    .kv-value { flex: 1; font-size: 0.9rem; color: var(--simr-tinta-2); }
    .kv-link { color: var(--simr-musgo); text-decoration: none; }
    .kv-link:hover { text-decoration: underline; color: var(--simr-cobre); }
    .sin-datos { color: var(--simr-tinta-2); font-size: 0.88rem; font-style: italic; margin: 0; opacity: 0.7; }
  `],
})
export class MateriaDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  protected readonly store = inject(MateriasStore);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadMateriaById(id);
    }
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/materias/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedMateria()?.nombre || 'esta materia';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar materia',
        message: `¿Confirma eliminar "${name}"?`,
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.store.deleteMateria(id);
        setTimeout(() => {
          if (!this.store.hasError()) {
            this.goBack();
          }
        }, 1000);
      }
    });
  }

  getNombre(r: any): string {
    return typeof r.id === 'object' ? r.id.nombre : r.id;
  }

  goBack() {
    this.router.navigate(['/materias']);
  }
}
