import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Chart, registerables, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PieController, ArcElement } from 'chart.js';

Chart.register(...registerables, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PieController, ArcElement);

interface SesionUso {
  _id: string;
  usuario: string;
  fecha: string;
  duracion: number;
  acciones: string[];
}

interface UsuarioUso {
  usuario: string;
  sesiones: number;
  tiempoTotal: number;
  acciones: string[];
}

interface EstadisticasUso {
  totalSesiones: number;
  usuariosActivos: number;
  tiempoPromedio: number;
  accionesMasUsadas: { accion: string; count: number }[];
  sesionesPorDia: { fecha: string; count: number }[];
  topUsuarios: UsuarioUso[];
}

@Component({
  selector: 'app-estadisticas-uso-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <p class="simr-eyebrow">Estadísticas de Uso</p>
        <h1>Estadísticas de Uso de la Aplicación</h1>
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
          <mat-card class="stat-card" appearance="outlined">
            <div class="stat-count">{{ data.totalSesiones }}</div>
            <div class="stat-label">Total Sesiones</div>
          </mat-card>

          <mat-card class="stat-card" appearance="outlined">
            <div class="stat-count">{{ data.usuariosActivos }}</div>
            <div class="stat-label">Usuarios Activos</div>
          </mat-card>

          <mat-card class="stat-card" appearance="outlined">
            <div class="stat-count">{{ data.tiempoPromedio | number:'1.0-0' }} min</div>
            <div class="stat-label">Tiempo Promedio (min)</div>
          </mat-card>
        </div>

        <div class="charts-grid">
          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header">
              <h2>Sesiones por Día</h2>
            </div>
            <div class="chart-wrapper">
              <canvas #barChart></canvas>
            </div>
          </mat-card>

          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header">
              <h2>Acciones Más Usadas</h2>
            </div>
            <div class="chart-wrapper">
              <canvas #pieChart></canvas>
            </div>
          </mat-card>
        </div>

        <mat-card class="table-card" appearance="outlined">
          <div class="chart-header">
            <h2>Top 10 Usuarios</h2>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Sesiones</th>
                <th>Tiempo (min)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of data.topUsuarios; track user.usuario) {
                <tr>
                  <td>{{ user.usuario }}</td>
                  <td>{{ user.sesiones }}</td>
                  <td>{{ user.tiempoTotal }}</td>
                  <td>
                    @for (action of user.acciones.slice(0, 3); track action) {
                      <span class="badge">{{ action }}</span>
                    }
                    @if (user.acciones.length > 3) {
                      <span class="badge">+{{ user.acciones.length - 3 }}</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .header h1 { margin: 0.2em 0 0; flex: 1; }
    .controls { margin-bottom: 1rem; }
    .controls input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--mat-sys-outline); }
    .loading { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-card { text-align: center; padding: 1.5rem; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; }
    .stat-count { font-size: 2.5rem; font-weight: 700; color: var(--simr-musgo); }
    .stat-label { font-size: 0.82rem; color: var(--simr-tinta-2); margin-top: 0.25rem; text-transform: uppercase; }
    .chart-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 1.5rem; }
    .chart-header h2 { margin: 0 0 1rem; font-size: 1.25rem; color: var(--simr-tinta); }
    .chart-wrapper { position: relative; height: 300px; }
    .table-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--mat-sys-outline); }
    .data-table th { background: var(--mat-sys-surface-variant); font-weight: 600; color: var(--simr-tinta); }
    .data-table tr:hover { background: var(--mat-sys-surface-container-lowest); }
    .badge { display: inline-block; background: var(--mat-primary-container); color: var(--mat-primary-on-container); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.25rem; cursor: default; }
  `],
})
export class EstadisticasUsoDashboardComponent implements OnInit, AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('barChart', { static: false }) barCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieCanvasRef!: ElementRef<HTMLCanvasElement>;

  protected data: EstadisticasUso | null = null;
  protected loading = true;
  protected error = '';

  private barChartInstance: any = null;
  private pieChartInstance: any = null;
  private viewInitialized = false;

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.tryCreateCharts();
  }

  refreshData() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.error = '';
    this.http.get<EstadisticasUso>(`${environment.apiUrl}/stats/usage`).subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.tryCreateCharts();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar estadísticas de uso';
        this.loading = false;
      },
    });
  }

  private tryCreateCharts() {
    if (this.viewInitialized && !this.loading && this.data) {
      setTimeout(() => this.createCharts(), 100);
    }
  }

  private createCharts() {
    this.createBarChart();
    this.createPieChart();
  }

  private createBarChart() {
    if (this.barChartInstance) this.barChartInstance.destroy();
    const ctx = this.barCanvasRef?.nativeElement?.getContext('2d');
    if (!ctx || !this.data) return;

    const labels = this.data.sesionesPorDia.map(s => new Date(s.fecha).toLocaleDateString('es-ES', { weekday: 'short' }));
    const counts = this.data.sesionesPorDia.map(s => s.count);

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sesiones',
          data: counts,
          backgroundColor: 'rgba(84, 110, 122, 0.7)',
          borderColor: 'rgba(84, 110, 122, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: 'var(--simr-tinta-2)' },
            grid: { color: 'var(--mat-sys-outline)' },
          },
          x: {
            ticks: { color: 'var(--simr-tinta-2)' },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'var(--mat-sys-surface-container-high)',
            titleColor: 'var(--simr-tinta)',
            bodyColor: 'var(--simr-tinta-2)',
          },
        },
      },
    });
  }

  private createPieChart() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    const ctx = this.pieCanvasRef?.nativeElement?.getContext('2d');
    if (!ctx || !this.data) return;

    const labels = this.data.accionesMasUsadas.map(a => a.accion);
    const data = this.data.accionesMasUsadas.map(a => a.count);

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(84, 110, 122, 0.7)',
            'rgba(184, 87, 0, 0.7)',
            'rgba(140, 151, 91, 0.7)',
            'rgba(74, 69, 42, 0.7)',
            'rgba(163, 38, 56, 0.7)',
            'rgba(100, 100, 100, 0.7)',
          ],
          borderColor: 'var(--mat-sys-surface)',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'var(--simr-tinta-2)',
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: 'var(--mat-sys-surface-container-high)',
            titleColor: 'var(--simr-tinta)',
            bodyColor: 'var(--simr-tinta-2)',
          },
        },
      },
    });
  }
}