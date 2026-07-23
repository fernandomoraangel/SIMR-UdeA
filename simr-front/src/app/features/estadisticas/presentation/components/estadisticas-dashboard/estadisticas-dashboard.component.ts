import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
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
        <div class="controls">
          <input type="text" placeholder="Filtrar estadísticas..." [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" />
        </div>

        <div class="cards-grid">
          @for (item of filteredStats; track item.key) {
            <mat-card class="stat-card" appearance="outlined">
              <div class="stat-count">{{ item.count }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </mat-card>
          }
        </div>

        <div class="charts-grid">
          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header">
              <h2>Distribución (Barras)</h2>
            </div>
            <div class="chart-wrapper">
              <canvas #statsChart></canvas>
            </div>
          </mat-card>

          <mat-card class="chart-card" appearance="outlined">
            <div class="chart-header">
              <h2>Distribución (Porcentual)</h2>
            </div>
            <div class="chart-wrapper">
              <canvas #pieChart></canvas>
            </div>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .header h1 { margin: 0.2em 0 0; }
    .controls { margin-bottom: 1rem; }
    .controls input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--mat-sys-outline); }
    .loading { display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 3rem; color: var(--simr-tinta-2); }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-card { text-align: center; padding: 1.25rem; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; }
    .stat-count { font-size: 2.25rem; font-weight: 700; color: var(--simr-musgo); }
    .stat-label { font-size: 0.82rem; color: var(--simr-tinta-2); margin-top: 0.25rem; text-transform: uppercase; }
    .chart-card { border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; padding: 1.5rem; }
    .chart-header h2 { margin: 0 0 1rem; font-size: 1.25rem; color: var(--simr-tinta); }
    .chart-wrapper { position: relative; height: 300px; }
  `],
})
export class EstadisticasDashboardComponent implements OnInit, AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('statsChart', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieCanvasRef!: ElementRef<HTMLCanvasElement>;

  private allStats: StatItem[] = [];
  protected filteredStats: StatItem[] = [];
  protected searchTerm = '';
  protected loading = true;
  protected error = '';

  private barChartInstance: Chart | null = null;
  private pieChartInstance: Chart | null = null;
  private viewInitialized = false;

  ngOnInit() {
    this.http.get<StatItem[]>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.allStats = data;
        this.filteredStats = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.tryCreateCharts();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar estadísticas';
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.tryCreateCharts();
  }

  private tryCreateCharts() {
    if (this.viewInitialized && !this.loading && this.allStats.length > 0) {
      setTimeout(() => this.createCharts());
    }
  }

  onFilterChange() {
    this.filteredStats = this.allStats.filter(s => 
      s.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.createCharts();
  }

  private createCharts() {
    this.createBarChart();
    this.createPieChart();
  }

  private createBarChart() {
    if (this.barChartInstance) this.barChartInstance.destroy();
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.filteredStats.map((s) => s.label),
        datasets: [{
          label: 'Cantidad',
          data: this.filteredStats.map((s) => s.count),
          backgroundColor: 'rgba(84, 110, 122, 0.7)',
        }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  private createPieChart() {
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    const ctx = this.pieCanvasRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.filteredStats.map((s) => s.label),
        datasets: [{
          data: this.filteredStats.map((s) => s.count),
          backgroundColor: ['#546E7A', '#BF5700', '#8C975B', '#4A452A', '#A32638'],
        }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
}
