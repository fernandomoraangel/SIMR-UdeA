import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { EjemplaresStore } from '../../../state/ejemplares.store';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ConfirmDialogComponent } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-ejemplar-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatChipsModule, MatDialogModule,
    CollapsibleSectionComponent,
  ],
  providers: [EjemplaresStore],
  template: `
    <div class="detail-container">
      <header class="detail-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (store.selectedEjemplar(); as e) {
          <div class="header-actions">
            <button mat-stroked-button (click)="navigateToEdit(e._id)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-stroked-button color="warn" (click)="confirmDelete(e._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        }
      </header>

      @if (store.isLoading()) {
        <div class="cargando">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando detalles del ejemplar…</span>
        </div>
      }
      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }
      @if (store.selectedEjemplar(); as e) {
        <mat-card class="ficha" appearance="outlined">
          <div class="ficha-cabecera">
            <div class="titulo">
              <mat-icon>library_add</mat-icon>
              <div>
                <h1>{{ resolvedRecursoNombre() || e.numeroEjemplar }}</h1>
                <span class="subtitulo">N° {{ e.numeroEjemplar }}</span>
              </div>
            </div>
            <span class="simr-codigo">ID {{ e._id }}</span>
          </div>

          @if (resolvedRecursoNombre()) {
            <app-collapsible-section title="Recurso asociado" icon="library_music">
              <p class="desc-text">{{ resolvedRecursoNombre() }}</p>
            </app-collapsible-section>
          }

          @if (resolvedFondoNombre()) {
            <app-collapsible-section title="Fondo" icon="inventory_2">
              <p class="desc-text">{{ resolvedFondoNombre() }}</p>
            </app-collapsible-section>
          }

          @if (resolvedColeccionNombre()) {
            <app-collapsible-section title="Colección" icon="collections_bookmark">
              <p class="desc-text">{{ resolvedColeccionNombre() }}</p>
            </app-collapsible-section>
          }

          @if (e.disponibilidad) {
            <app-collapsible-section title="Disponibilidad" icon="check_circle">
              <span class="disponibilidad-badge">{{ e.disponibilidad }}</span>
            </app-collapsible-section>
          }

          @if (e.procedencia) {
            <app-collapsible-section title="Procedencia" icon="location_on">
              <p class="desc-text">{{ e.procedencia }}</p>
            </app-collapsible-section>
          }

          @if (e.estados?.length) {
            <app-collapsible-section title="Estados" icon="flag">
              <div class="estados-list">
                @for (st of e.estados; track $index) {
                  <div class="estado-chip">
                    <span class="estado-etiqueta">{{ st.etiqueta }}</span>
                    <span class="estado-contenido">{{ st.contenido }}</span>
                  </div>
                }
              </div>
            </app-collapsible-section>
          }

          <section class="seccion">
            <h3><mat-icon>person</mat-icon> Información del Creador</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre completo</label>
                <span>{{ getCreatorName(e.creador) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de creación</label>
                <span>{{ e.creado | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>
        </mat-card>
      } @else {
        @if (!store.isLoading()) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Ejemplar no encontrado.</p>
            <button mat-stroked-button routerLink="/ejemplares">Volver al listado</button>
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
    .subtitulo { font-family: var(--simr-mono); font-size: 0.9rem; color: rgba(251, 249, 244, 0.7); }
    .ficha-cabecera .simr-codigo { color: rgba(251, 249, 244, 0.7); }
    .desc-text { padding: 0.5rem 0; line-height: 1.6; color: var(--simr-tinta-2); }
    .disponibilidad-badge { display: inline-block; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 4px; padding: 0.25rem 0.75rem; font-size: 0.9rem; color: var(--simr-tinta); }
    .estados-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .estado-chip { display: flex; align-items: center; gap: 0.75rem; background: var(--simr-papel); border: 1px solid var(--mat-sys-outline); border-radius: 8px; padding: 0.5rem 0.75rem; }
    .estado-etiqueta { font-weight: 600; font-size: 0.85rem; color: var(--simr-tinta); min-width: 120px; }
    .estado-contenido { font-size: 0.85rem; color: var(--simr-tinta-2); }
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
export class EjemplarDetailComponent implements OnInit {
  protected readonly store = inject(EjemplaresStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);

  protected ejemplarId: string | null = null;
  protected readonly ejemplar = this.store.selectedEjemplar;

  protected resolvedRecursoNombre = signal<string>('');
  protected resolvedFondoNombre = signal<string>('');
  protected resolvedColeccionNombre = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.ejemplarId = id;
        this.store.setInitialState();
        this.store.loadById(id);
        this.resolveNames(id);
      }
    });
  }

  private resolveNames(id: string) {
    this.http.get(`${environment.apiUrl}/ejemplares/${id}`).subscribe({
      next: (ejemplar: any) => {
        if (ejemplar.recurso) {
          this.http.get(`${environment.apiUrl}/recursos/${ejemplar.recurso}`).subscribe({
            next: (rec: any) => this.resolvedRecursoNombre.set(rec.titulo || rec.nombre || '—'),
            error: () => this.resolvedRecursoNombre.set('—'),
          });
        }
        if (ejemplar.fondo) {
          this.http.get(`${environment.apiUrl}/fondos/${ejemplar.fondo}`).subscribe({
            next: (f: any) => this.resolvedFondoNombre.set(f.nombre || '—'),
            error: () => this.resolvedFondoNombre.set('—'),
          });
        }
        if (ejemplar.coleccion) {
          this.http.get(`${environment.apiUrl}/colecciones/${ejemplar.coleccion}`).subscribe({
            next: (c: any) => this.resolvedColeccionNombre.set(c.nombre || '—'),
            error: () => this.resolvedColeccionNombre.set('—'),
          });
        }
      },
      error: () => {},
    });
  }

  protected getCreatorName(creador: any): string {
    if (!creador) return '—';
    if (creador.fullName) return creador.fullName;
    const parts = [creador.firstName, creador.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/ejemplares/edit', id]);
  }

  confirmDelete(id: string) {
    const name = this.store.selectedEjemplar()?.numeroEjemplar || 'este ejemplar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar ejemplar', message: `¿Confirma eliminar "${name}"?`, confirmText: 'Eliminar', danger: true },
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
    this.router.navigate(['/ejemplares']);
  }
}
