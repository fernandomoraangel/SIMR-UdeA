import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-no-implementado',
  standalone: false,
  template: `
    <div class="no-implementado-container">
      <mat-card class="no-implementado-card" appearance="outlined">
        <mat-card-content>
          <div class="icono">
            <mat-icon>construction</mat-icon>
          </div>
          <p class="simr-eyebrow">En construcción</p>
          <h2>{{ titulo }}</h2>
          <p>
            Esta sección aún no ha sido migrada desde AngularJS a Angular.
            Forma parte del plan de migración incremental (Strangler) y estará
            disponible próximamente.
          </p>
          <a mat-raised-button color="primary" routerLink="/">Volver al inicio</a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .no-implementado-container {
        display: flex;
        justify-content: center;
        padding: 48px 16px;
      }
      .no-implementado-card {
        max-width: 520px;
        text-align: center;
        padding: 24px;
        border-color: var(--mat-sys-outline) !important;
        border-radius: 14px !important;
      }
      .icono mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--simr-sello);
      }
      h2 {
        font-family: var(--simr-display);
        font-weight: 600;
        margin: 12px 0 8px;
        text-transform: capitalize;
      }
      p {
        color: var(--simr-tinta-2);
        margin-bottom: 24px;
      }
    `,
  ],
})
export class NoImplementadoComponent {
  @Input() titulo = 'Módulo no implementado';

  constructor(route: ActivatedRoute) {
    const modulo = route.snapshot.paramMap.get('modulo') || '';
    this.titulo = modulo
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
