import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StatItem {
  key: string;
  label: string;
  count: number;
}

@Component({
  selector: 'app-estadisticas-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <p class="simr-eyebrow">Estadísticas</p>
        <h1>Estadísticas del Sistema</h1>
      </header>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando estadísticas…</span>
        </div>
      }

      @if (error) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      }

      @if (!loading && !error) {
        <div class="cards-grid">
          @for (item of stats; track item.key) {
            <mat-card class="stat-card" appearance="outlined">
              <div class="stat-count">{{ item.count }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </mat-card>
          }
        </div>

        <mat-card class="chart-card" appearance="outlined">
          <div class="chart-header">
            <h2>Distribución general</h2>
          </div>
          <div class="chart-wrapper">
            <canvas #statsChart></canvas>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .header h1 { margin: 0.2em 0 0; }
    .loading { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { text-align: center; padding: 1.25rem; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; transition: transform 0.2s ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(31,42,36,0.1) !important; }
    .stat-count { font-size: 2.25rem; font-weight: 700; color: var(--simr-musgo); line-height: 1.2; }
    .stat-label { font-size: 0.82rem; color: var(--simr-tinta-2); margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .chart-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; padding: 1.5rem; }
    .chart-header h2 { margin: 0 0 1rem; font-family: var(--simr-display); font-size: 1.25rem; color: var(--simr-tinta); }
    .chart-wrapper { position: relative; max-height: 500px; }
  `],
})
export class EstadisticasDashboardComponent implements OnInit, AfterViewInit {
  private readonly http = inject(HttpClient);

  @ViewChild('statsChart', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  protected stats: StatItem[] = [];
  protected loading = true;
  protected error = '';

  private chartInstance: Chart | null = null;

  ngOnInit() {
    this.http.get<StatItem[]>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.createChart();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar estadísticas';
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    if (!this.loading && this.stats.length > 0) {
      this.createChart();
    }
  }

  private createChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (!ctx || this.stats.length === 0) return;

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stats.map((s) => s.label),
        datasets: [{
          label: 'Cantidad de registros',
          data: this.stats.map((s) => s.count),
          backgroundColor: [
            'rgba(84, 110, 122, 0.7)',
            'rgba(191, 87, 0, 0.7)',
            'rgba(140, 151, 91, 0.7)',
            'rgba(74, 69, 42, 0.7)',
            'rgba(163, 38, 56, 0.7)',
            'rgba(47, 62, 70, 0.7)',
            'rgba(160, 116, 69, 0.7)',
            'rgba(92, 105, 67, 0.7)',
            'rgba(130, 52, 53, 0.7)',
            'rgba(57, 68, 75, 0.7)',
            'rgba(175, 130, 85, 0.7)',
            'rgba(110, 120, 80, 0.7)',
            'rgba(150, 65, 60, 0.7)',
            'rgba(70, 80, 90, 0.7)',
            'rgba(140, 100, 65, 0.7)',
            'rgba(100, 110, 70, 0.7)',
          ],
          borderColor: [
            '#546E7A', '#BF5700', '#8C975B', '#4A452A',
            '#A32638', '#2F3E46', '#A07445', '#5C6943',
            '#823435', '#39444B', '#AF8255', '#6E7850',
            '#96413C', '#46505A', '#8C6441', '#646E46',
          ],
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} registro(s)`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, font: { size: 11 } },
          },
        },
      },
    });
  }
}
