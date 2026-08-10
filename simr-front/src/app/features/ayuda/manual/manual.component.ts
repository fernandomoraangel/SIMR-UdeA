import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CollapsibleSectionComponent } from '@shared/collapsible-section/collapsible-section.component';
import { MANUAL_GRUPOS } from './manual.data';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CollapsibleSectionComponent,
  ],
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.css'],
})
export class ManualComponent implements OnInit, AfterViewInit, OnDestroy {
  grupos = MANUAL_GRUPOS;
  busqueda = '';
  activo = '';
  tocAbierto = false;
  colapsado: Record<string, boolean> = {};
  private observer?: IntersectionObserver;

  ngOnInit() {
    for (const g of this.grupos) this.colapsado[g.id] = false;
  }

  ngAfterViewInit() {
    this.vincularObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  get gruposFiltrados() {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.grupos;
    return this.grupos
      .map((grupo) => ({
        ...grupo,
        modulos: grupo.modulos.filter(
          (m) =>
            m.nombre.toLowerCase().includes(q) ||
            m.descripcion.toLowerCase().includes(q) ||
            (m.contenido ?? []).some((p) => p.toLowerCase().includes(q)) ||
            (m.campos ?? []).some((c) => c.toLowerCase().includes(q)) ||
            (m.extras ?? []).some((e) => e.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.modulos.length > 0);
  }

  onBusqueda() {
    if (!this.gruposFiltrados.some((g) => g.id === this.activo)) this.activo = '';
    setTimeout(() => this.vincularObserver());
  }

  onCollapseChange(id: string, estado: boolean) {
    this.colapsado[id] = estado;
  }

  irAGrupo(id: string) {
    this.colapsado[id] = false;
    this.tocAbierto = false;
    requestAnimationFrame(() => {
      document.getElementById('grupo-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  irArriba() {
    this.tocAbierto = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private vincularObserver() {
    this.observer?.disconnect();
    const secciones = Array.from(document.querySelectorAll<HTMLElement>('.grupo'));
    if (!secciones.length) return;
    this.observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) this.activo = entrada.target.id.replace('grupo-', '');
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    secciones.forEach((s) => this.observer!.observe(s));
  }

  etiquetaAcceso(acceso: string): string {
    switch (acceso) {
      case 'publico':
        return 'Público';
      case 'sesion':
        return 'Con sesión';
      case 'admin':
        return 'Admin';
      default:
        return acceso;
    }
  }

  colorAcceso(acceso: string): string {
    switch (acceso) {
      case 'publico':
        return 'var(--simr-musgo)';
      case 'sesion':
        return 'var(--simr-cobre)';
      case 'admin':
        return 'var(--simr-sello)';
      default:
        return 'var(--simr-tinta)';
    }
  }
}