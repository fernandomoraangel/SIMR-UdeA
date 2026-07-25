import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Chart, registerables, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PieController, ArcElement, DoughnutController } from 'chart.js';
import type { ApiResponse, EstadisticasUsoData, EstadisticasModulo, EstadisticasRol, EstadisticasEntidad, SesionPorDia, TopUsuario } from '../../../models/sesion-uso.model';

Chart.register(...registerables, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PieController, ArcElement, DoughnutController);

type Vista = 'resumen' | 'roles' | 'modulos' | 'entidades' | 'usuarios';

@Component({
  selector: 'app-estadisticas-uso-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <div>
          <p class="simr-eyebrow">Utilidades</p>
          <h1>Estadísticas de Uso de la Aplicación</h1>
        </div>
        <button mat-raised-button color="primary" (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
          <span>Actualizar</span>
        </button>
      </header>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando estadísticas de uso…</span>
        </div>
      }

      @if (error) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      }

      @if (!loading && !error && data) {
        <div class="cards-grid">
          <mat-card class="stat-card" appearance="outlined" (click)="cambiarVista('resumen')">
            <div class="stat-count">{{ data.generales.totalSesiones }}</div>
            <div class="stat-label">Total Sesiones</div>
          </mat-card>
          <mat-card class="stat-card" appearance="outlined" (click)="cambiarVista('usuarios')">
            <div class="stat-count">{{ data.generales.usuariosUnicos }}</div>
            <div class="stat-label">Usuarios Únicos</div>
          </mat-card>
          <mat-card class="stat-card" appearance="outlined" (click)="cambiarVista('roles')">
            <div class="stat-count">{{ data.porRol.length }}</div>
            <div class="stat-label">Roles Activos</div>
          </mat-card>
          <mat-card class="stat-card" appearance="outlined">
            <div class="stat-count">{{ data.generales.promedioDuracionMinutos }} min</div>
            <div class="stat-label">Tiempo Promedio</div>
          </mat-card>
        </div>

        <div class="tabs">
          <button [class.active]="vista==='resumen'" (click)="cambiarVista('resumen')">Resumen</button>
          <button [class.active]="vista==='roles'" (click)="cambiarVista('roles')">Por Rol</button>
          <button [class.active]="vista==='modulos'" (click)="cambiarVista('modulos')">Por Módulo</button>
          <button [class.active]="vista==='entidades'" (click)="cambiarVista('entidades')">Por Entidad</button>
          <button [class.active]="vista==='usuarios'" (click)="cambiarVista('usuarios')">Top Usuarios</button>
        </div>

        @if (vista === 'resumen') {
          <div class="charts-grid">
            <mat-card class="chart-card" appearance="outlined">
              <div class="chart-header"><h2>Sesiones por Día (últimos 30 días)</h2></div>
              <div class="chart-wrapper"><canvas #barChart></canvas></div>
            </mat-card>
            <mat-card class="chart-card" appearance="outlined">
              <div class="chart-header"><h2>Sesiones por Módulo</h2></div>
              <div class="chart-wrapper"><canvas #moduloPieChart></canvas></div>
            </mat-card>
          </div>
        }

        @if (vista === 'roles') {
          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header"><h2>Uso por Rol</h2></div>
            <div class="chart-wrapper" style="height: 400px;"><canvas #rolChart></canvas></div>
          </mat-card>
          <div class="table-card mat-elevation-z2">
            <table class="data-table">
              <thead><tr><th>Rol</th><th>Usuarios</th><th>Sesiones</th><th>Tiempo Total (min)</th></tr></thead>
              <tbody>
                @for (r of data.porRol; track r.rol) {
                  <tr><td><span class="badge">{{ r.rol }}</span></td><td>{{ r.usuariosUnicos }}</td><td>{{ r.sesiones }}</td><td>{{ r.duracionTotalMinutos }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (vista === 'modulos') {
          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header"><h2>Sesiones por Módulo</h2></div>
            <div class="chart-wrapper" style="height: 400px;"><canvas #moduloBarChart></canvas></div>
          </mat-card>
          <div class="table-card mat-elevation-z2">
            <table class="data-table">
              <thead><tr><th>Módulo</th><th>Sesiones</th><th>Tiempo Total (min)</th></tr></thead>
              <tbody>
                @for (m of data.porModulo; track m.modulo) {
                  <tr><td>{{ m.modulo }}</td><td>{{ m.sesiones }}</td><td>{{ m.duracionTotalMinutos }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (vista === 'entidades') {
          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header"><h2>Acciones por Entidad</h2></div>
            <div class="chart-wrapper" style="height: 400px;"><canvas #entidadChart></canvas></div>
          </mat-card>
          <div class="table-card mat-elevation-z2">
            <table class="data-table">
              <thead><tr><th>Entidad</th><th>Total Acciones</th><th>Vistas</th><th>Creaciones</th><th>Ediciones</th><th>Eliminaciones</th></tr></thead>
              <tbody>
                @for (e of data.porEntidad; track e.entidad) {
                  <tr>
                    <td>{{ e.entidad }}</td><td>{{ e.total }}</td>
                    <td>{{ e.acciones['view'] || 0 }}</td>
                    <td>{{ e.acciones['create'] || 0 }}</td>
                    <td>{{ e.acciones['update'] || 0 }}</td>
                    <td>{{ e.acciones['delete'] || 0 }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (vista === 'usuarios') {
          <div class="table-card mat-elevation-z2">
            <table class="data-table">
              <thead><tr><th>Usuario</th><th>Sesiones</th><th>Tiempo (min)</th><th>Módulos Visitados</th></tr></thead>
              <tbody>
                @for (u of data.topUsuarios; track u.usuario) {
                  <tr><td>{{ u.nombre }}</td><td>{{ u.sesiones }}</td><td>{{ u.duracionTotalMinutos }}</td><td>{{ u.modulosVisitados }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .header h1 { margin: 0.2em 0 0; flex: 1; }
    .loading { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { text-align: center; padding: 1.5rem; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; cursor: pointer; transition: box-shadow .2s; }
    .stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }
    .stat-count { font-size: 2.5rem; font-weight: 700; color: var(--simr-musgo); }
    .stat-label { font-size: 0.82rem; color: var(--simr-tinta-2); margin-top: 0.25rem; text-transform: uppercase; }
    .tabs { display: flex; gap: .25rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .tabs button { padding: .5rem 1.25rem; border: 1px solid var(--mat-sys-outline); background: transparent; border-radius: 8px; cursor: pointer; font-size: .9rem; color: var(--simr-tinta-2); transition: all .15s; }
    .tabs button.active { background: var(--simr-musgo); color: #fff; border-color: var(--simr-musgo); }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .chart-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 1.5rem; margin-bottom: 2rem; }
    .chart-header h2 { margin: 0 0 1rem; font-size: 1.25rem; color: var(--simr-tinta); }
    .chart-wrapper { position: relative; height: 300px; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; margin-bottom: 2rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--mat-sys-outline); }
    .data-table th { background: var(--mat-sys-surface-variant); font-weight: 600; color: var(--simr-tinta); }
    .data-table tr:hover { background: var(--mat-sys-surface-container-lowest); }
    .badge { display: inline-block; background: var(--mat-primary-container); color: var(--mat-primary-on-container); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; cursor: default; }
  `],
})
export class EstadisticasUsoDashboardComponent implements OnInit, AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('barChart', { static: false }) barCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('moduloPieChart', { static: false }) moduloPieRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rolChart', { static: false }) rolChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('moduloBarChart', { static: false }) moduloBarRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('entidadChart', { static: false }) entidadChartRef!: ElementRef<HTMLCanvasElement>;

  protected data: EstadisticasUsoData | null = null;
  protected loading = true;
  protected error = '';
  protected vista: Vista = 'resumen';

  private chartInstances: Chart[] = [];
  private viewReady = false;

  ngOnInit() { this.loadData(); }
  ngAfterViewInit() { this.viewReady = true; }

  cambiarVista(v: Vista) {
    this.vista = v;
    this.cdr.detectChanges();
    this.rebuildCharts();
  }

  refreshData() { this.loadData(); }

  private loadData() {
    this.loading = true;
    this.error = '';
    this.http.get<ApiResponse<EstadisticasUsoData>>(`${environment.apiUrl}/stats/usage`).subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
        this.cdr.detectChanges();
        this.rebuildCharts();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar estadísticas de uso';
        this.loading = false;
      },
    });
  }

  private rebuildCharts() {
    if (!this.viewReady || this.loading || !this.data) return;
    setTimeout(() => {
      this.destroyCharts();
      this.createBarChart();
      this.createModuloPieChart();
      this.createRolChart();
      this.createModuloBarChart();
      this.createEntidadChart();
    }, 100);
  }

  private destroyCharts() {
    for (const c of this.chartInstances) c.destroy();
    this.chartInstances = [];
  }

  private createBarChart() {
    const ctx = this.barCanvasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.data!.sesionesPorDia;
    const c = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(s => s.fecha.slice(5)),
        datasets: [{
          label: 'Sesiones',
          data: data.map(s => s.sesiones),
          backgroundColor: 'rgba(84, 110, 122, 0.7)',
          borderColor: 'rgba(84, 110, 122, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { color: 'var(--simr-tinta-2)' }, grid: { color: 'var(--mat-sys-outline)' } }, x: { ticks: { color: 'var(--simr-tinta-2)' }, grid: { display: false } } },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--mat-sys-surface-container-high)', titleColor: 'var(--simr-tinta)', bodyColor: 'var(--simr-tinta-2)' } },
      },
    });
    this.chartInstances.push(c);
  }

  private createModuloPieChart() {
    const ctx = this.moduloPieRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.data!.porModulo.slice(0, 8);
    const colors = ['rgba(84,110,122,0.7)','rgba(184,87,0,0.7)','rgba(140,151,91,0.7)','rgba(74,69,42,0.7)','rgba(163,38,56,0.7)','rgba(100,100,100,0.7)','rgba(50,130,140,0.7)','rgba(180,120,60,0.7)'];
    const c = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(m => m.modulo),
        datasets: [{ data: data.map(m => m.sesiones), backgroundColor: colors.slice(0, data.length), borderColor: 'var(--mat-sys-surface)', borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: 'var(--simr-tinta-2)', usePointStyle: true, padding: 15 } }, tooltip: { backgroundColor: 'var(--mat-sys-surface-container-high)', titleColor: 'var(--simr-tinta)', bodyColor: 'var(--simr-tinta-2)' } },
      },
    });
    this.chartInstances.push(c);
  }

  private createRolChart() {
    const ctx = this.rolChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.data!.porRol;
    const c = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(r => r.rol),
        datasets: [
          { label: 'Sesiones', data: data.map(r => r.sesiones), backgroundColor: 'rgba(84, 110, 122, 0.7)', borderColor: 'rgba(84, 110, 122, 1)', borderWidth: 1 },
          { label: 'Usuarios', data: data.map(r => r.usuariosUnicos), backgroundColor: 'rgba(140, 151, 91, 0.7)', borderColor: 'rgba(140, 151, 91, 1)', borderWidth: 1 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { color: 'var(--simr-tinta-2)' }, grid: { color: 'var(--mat-sys-outline)' } }, x: { ticks: { color: 'var(--simr-tinta-2)' }, grid: { display: false } } },
        plugins: { legend: { position: 'top', labels: { color: 'var(--simr-tinta-2)', usePointStyle: true } }, tooltip: { backgroundColor: 'var(--mat-sys-surface-container-high)', titleColor: 'var(--simr-tinta)', bodyColor: 'var(--simr-tinta-2)' } },
      },
    });
    this.chartInstances.push(c);
  }

  private createModuloBarChart() {
    const ctx = this.moduloBarRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.data!.porModulo;
    const c = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(m => m.modulo),
        datasets: [{
          label: 'Sesiones', data: data.map(m => m.sesiones),
          backgroundColor: 'rgba(84, 110, 122, 0.7)', borderColor: 'rgba(84, 110, 122, 1)', borderWidth: 1,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: { x: { beginAtZero: true, ticks: { color: 'var(--simr-tinta-2)' }, grid: { color: 'var(--mat-sys-outline)' } }, y: { ticks: { color: 'var(--simr-tinta-2)' }, grid: { display: false } } },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--mat-sys-surface-container-high)', titleColor: 'var(--simr-tinta)', bodyColor: 'var(--simr-tinta-2)' } },
      },
    });
    this.chartInstances.push(c);
  }

  private createEntidadChart() {
    const ctx = this.entidadChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const data = this.data!.porEntidad;
    if (data.length === 0) return;
    const c = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(e => e.entidad),
        datasets: [
          { label: 'Vistas', data: data.map(e => e.acciones['view'] || 0), backgroundColor: 'rgba(84, 110, 122, 0.7)' },
          { label: 'Creaciones', data: data.map(e => e.acciones['create'] || 0), backgroundColor: 'rgba(140, 151, 91, 0.7)' },
          { label: 'Ediciones', data: data.map(e => e.acciones['update'] || 0), backgroundColor: 'rgba(184, 87, 0, 0.7)' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { color: 'var(--simr-tinta-2)' }, grid: { color: 'var(--mat-sys-outline)' } }, x: { ticks: { color: 'var(--simr-tinta-2)' }, grid: { display: false } } },
        plugins: { legend: { position: 'top', labels: { color: 'var(--simr-tinta-2)', usePointStyle: true } }, tooltip: { backgroundColor: 'var(--mat-sys-surface-container-high)', titleColor: 'var(--simr-tinta)', bodyColor: 'var(--simr-tinta-2)' } },
      },
    });
    this.chartInstances.push(c);
  }
}