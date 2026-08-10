import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import pkg from '../../../../../package.json';

@Component({
  selector: 'app-acerca-de',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="simr-eyebrow">Ayuda</p>
          <h1 class="page-title">Acerca de</h1>
        </div>
      </header>

      <mat-card appearance="outlined" class="about-card">
        <img class="logo" src="assets/images/logomr.png" alt="Logo del grupo Músicas Regionales" />
        <h2 class="nombre">Sistema de Información Músicas Regionales (SIMR)</h2>
        <p class="version">Versión {{ version }}</p>

        <dl class="datos">
          <div class="fila">
            <dt>Grupo de investigación</dt>
            <dd>Músicas Regionales</dd>
          </div>
          <div class="fila">
            <dt>Institución</dt>
            <dd>Universidad de Antioquia</dd>
          </div>
          <div class="fila">
            <dt>Conceptualización</dt>
            <dd>Grupo de Investigación Músicas Regionales</dd>
          </div>
          <div class="fila">
            <dt>Desarrollo</dt>
            <dd>Fernando Mora Ángel</dd>
          </div>
          <div class="fila">
            <dt>Año</dt>
            <dd>2022</dd>
          </div>
        </dl>

        <p class="resumen">
          El SIMR es una aplicación de gestión bibliotecaria y archivística, y de gestión del
          conocimiento, orientada a investigadores. Administra y analiza el catálogo del Fondo de
          documentación del grupo, sus colecciones virtuales de audios, partituras, imágenes y
          vídeos, e integra la información de los proyectos de investigación con registros de obras,
          actores, recursos, ejemplares y vocabularios controlados.
        </p>

        <div class="acciones">
          <a mat-flat-button color="primary" routerLink="/ayuda/manual">
            <mat-icon>menu_book</mat-icon> Manual interactivo
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 760px; margin: 0 auto; padding: 28px 24px 56px; }
    .page-head { margin-bottom: 18px; }
    .page-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.9rem; margin: 0; }
    .about-card { padding: 32px 36px; text-align: center; }
    .logo { width: 96px; height: 96px; object-fit: contain; margin-bottom: 14px; }
    h2 { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.35rem; margin: 6px 0; }
    .version { font-family: var(--simr-mono); color: var(--simr-musgo); font-size: 0.85rem; margin: 4px 0 18px; }
    .datos { margin: 0 0 20px; text-align: left; }
    .fila { display: flex; justify-content: space-between; gap: 20px; padding: 8px 0; border-bottom: 1px solid var(--mat-sys-outline); }
    .fila:last-of-type { border-bottom: none; }
    dt { font-family: var(--simr-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--simr-musgo); }
    dd { margin: 0; color: var(--simr-tinta); text-align: right; }
    .resumen { color: var(--simr-tinta-2); line-height: 1.6; text-align: justify; margin: 0 0 22px; }
    .acciones { display: flex; justify-content: center; }
  `],
})
export class AcercaDeComponent {
  version = pkg.version || '1.0.0';
}