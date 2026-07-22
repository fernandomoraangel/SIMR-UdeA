import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-help-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Instrucciones de uso</h2>
    <mat-dialog-content>
      <h6>Uso:</h6>
      <ul>
        <li>Selecciona una o más entidades para visualizar.</li>
        <li>Opcionalmente, escribe una consulta de búsqueda (ej: "salsa OR bachata").</li>
        <li>Haz clic en "Generar Grafo".</li>
        <li>Usa la rueda del mouse para hacer zoom, arrastra nodos para reorganizar.</li>
        <li>Pasa el cursor sobre un nodo para ver información, haz clic para ver detalles.</li>
      </ul>
      <h6>Operadores:</h6>
      <ul>
        <li><code>AND</code>, <code>OR</code>, <code>NOT</code> para lógica.</li>
        <li><code>()</code> para agrupar expresiones.</li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h6 { margin-top: 1rem; font-weight: 600; color: var(--simr-tinta); }
    ul { padding-left: 1.5rem; color: var(--simr-tinta-2); }
    code { font-family: var(--simr-mono); color: var(--simr-sello); }
  `]
})
export class HelpDialogComponent {}
