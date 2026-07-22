import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  HsClassificationService,
  HsNode,
  HsSearchResult,
} from './hs-classification.service';

export interface HsWizardData {
  initialCode?: string;
}

@Component({
  selector: 'app-hs-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatDialogModule, MatProgressBarModule,
  ],
  template: `
    <div class="hs-wizard">
      <div class="wizard-header">
        <h2>Clasificador Hornbostel-Sachs</h2>
        <p class="simr-eyebrow">Sistema decimal de clasificación de instrumentos musicales</p>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <!-- Breadcrumb -->
      @if (breadcrumb().length > 0) {
        <div class="breadcrumb">
            @for (b of breadcrumb(); track $index) {
              <button mat-button (click)="goToLevel($index)" class="crumb">
                {{ hsName(b) }}
              </button>
            @if ($index < breadcrumb().length - 1) {
              <mat-icon>chevron_right</mat-icon>
            }
          }
        </div>
      }

      <!-- Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar en la clasificación</mat-label>
        <input matInput [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Ej: guitarra, 321.322, laúd..." />
        <mat-icon matPrefix>search</mat-icon>
        @if (searchQuery()) {
          <button matSuffix mat-icon-button (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Search Results -->
      @if (searchResults().length > 0) {
        <div class="search-results">
          @for (r of searchResults(); track r.code) {
            <div class="search-item" (click)="selectSearchResult(r)">
              <div class="search-code">{{ r.code }}</div>
              <div class="search-name">{{ hsName(r) }}</div>
              <div class="search-path">{{ r.path }}</div>
            </div>
          }
        </div>
      }

      <!-- Current Level Cards -->
      @if (!searchQuery() || searchResults().length === 0) {
        <div class="level-hint">
          <mat-icon>touch_app</mat-icon>
          <span>{{ currentLevelLabel() }}</span>
        </div>
        <div class="cards-grid">
          @for (node of currentNodes(); track node.code) {
            <mat-card class="hs-card" appearance="outlined" (click)="selectNode(node)">
              <mat-card-header>
                <mat-card-title>{{ node.code }}</mat-card-title>
                <mat-card-subtitle>{{ hsName(node) }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="desc">{{ node.description | slice:0:120 }}{{ node.description.length > 120 ? '…' : '' }}</p>
                @if (node.children.length > 0) {
                  <div class="child-count">
                    <mat-icon>account_tree</mat-icon>
                    {{ node.children.length }} subcategoría(s)
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- Selection info & Suffix -->
      @if (currentPath(); as path) {
        <div class="selection-bar">
          <div class="selection-code">
            <span class="label">Clasificación actual:</span>
            <span class="code">{{ fullCode() }}</span>
            @if (selectedSuffix()) {
              <span class="suffix-badge">-{{ selectedSuffix() }}</span>
            }
          </div>
          <div class="selection-actions">
            @if (canGoDeeper()) {
              <span class="hint">Selecciona una subcategoría para continuar</span>
            }
            @if (selectedSuffix() === null) {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="suffix-field">
                <mat-label>Sufijo (opcional)</mat-label>
                <mat-select [(value)]="selectedSuffix">
                  <mat-option [value]="null">— Sin sufijo —</mat-option>
                  @for (s of suffixes | keyvalue; track s.key) {
                    <mat-option [value]="s.key">-{{ s.key }} ({{ s.value }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
          </div>
        </div>
      }

      <div class="dialog-actions">
        <button mat-stroked-button (click)="dialogRef.close(null)">Cancelar</button>
        <button mat-flat-button color="primary" (click)="accept()">
          <mat-icon>check</mat-icon>
          Aceptar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .hs-wizard { min-width: 520px; max-width: 720px; padding: 0; }
    .wizard-header { padding: 1.5rem 1.5rem 0; }
    .wizard-header h2 { margin: 0 0 0.2rem; font-family: var(--simr-display); font-weight: 600; }
    .wizard-header .simr-eyebrow { color: var(--simr-tinta-2); margin: 0; }
    .breadcrumb { display: flex; align-items: center; flex-wrap: wrap; padding: 0.75rem 1.5rem; gap: 0.15rem; border-bottom: 1px solid var(--mat-sys-outline); }
    .crumb { font-size: 0.8rem; min-width: 0; line-height: 28px; }
    .crumb mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--simr-tinta-2); }
    .search-field { margin: 0.75rem 1.5rem; width: calc(100% - 3rem); }
    .search-results { max-height: 300px; overflow-y: auto; margin: 0 1.5rem; border: 1px solid var(--mat-sys-outline); border-radius: 10px; }
    .search-item { padding: 0.6rem 0.75rem; cursor: pointer; border-bottom: 1px solid var(--mat-sys-outline); transition: background 0.15s; }
    .search-item:hover { background: var(--simr-hueso); }
    .search-item:last-child { border-bottom: none; }
    .search-code { font-weight: 700; font-size: 0.85rem; color: var(--simr-musgo); font-family: 'IBM Plex Mono', monospace; }
    .search-name { font-size: 0.9rem; color: var(--simr-tinta); }
    .search-path { font-size: 0.75rem; color: var(--simr-tinta-2); }
    .level-hint { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.5rem 0; font-size: 0.82rem; color: var(--simr-tinta-2); }
    .level-hint mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; padding: 0.75rem 1.5rem; max-height: 350px; overflow-y: auto; }
    .hs-card { border-radius: 10px !important; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .hs-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(31,42,36,0.12) !important; }
    .hs-card mat-card-title { font-family: 'IBM Plex Mono', monospace; font-size: 1rem; color: var(--simr-musgo); }
    .hs-card mat-card-subtitle { font-size: 0.82rem; }
    .hs-card .desc { font-size: 0.78rem; color: var(--simr-tinta-2); line-height: 1.4; margin: 0.5rem 0 0; }
    .child-count { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--simr-sello); margin-top: 0.5rem; }
    .child-count mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .selection-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding: 1rem 1.5rem; background: var(--simr-hueso); border-top: 1px solid var(--mat-sys-outline); }
    .selection-code { display: flex; align-items: center; gap: 0.5rem; }
    .selection-code .label { font-size: 0.8rem; color: var(--simr-tinta-2); }
    .selection-code .code { font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 1.1rem; color: var(--simr-musgo); }
    .suffix-badge { background: var(--simr-cobre); color: white; border-radius: 4px; padding: 0.1rem 0.4rem; font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; }
    .selection-actions { display: flex; align-items: center; gap: 0.75rem; }
    .hint { font-size: 0.78rem; color: var(--simr-tinta-2); }
    .suffix-field { width: 200px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--mat-sys-outline); }
  `],
})
export class HsWizardComponent implements OnInit {
  dialogRef = inject<MatDialogRef<HsWizardComponent, string | null>>(MatDialogRef);
  data = inject<HsWizardData>(MAT_DIALOG_DATA);
  protected readonly hsService = inject(HsClassificationService);

  protected loading = signal(true);
  protected level = signal(0);
  protected currentNodes = signal<HsNode[]>([]);
  protected history = signal<HsNode[]>([]);
  protected selectedSuffix = signal<string | null>(null);
  protected searchQuery = signal('');
  protected searchResults = signal<HsSearchResult[]>([]);
  protected suffixes: Record<string, string> = {};

  protected currentPath = computed(() => this.history());
  protected breadcrumb = computed(() => {
    const path = this.currentPath();
    if (path.length === 0) return [{ code: '', name: 'Inicio' }];
    return [{ code: '', name: 'Inicio' }, ...path];
  });

  protected fullCode = computed(() => {
    const path = this.currentPath();
    if (path.length === 0) return '—';
    let code = path[path.length - 1].code;
    const suffix = this.selectedSuffix();
    if (suffix) code += '-' + suffix;
    return code;
  });

  protected canGoDeeper = computed(() => {
    const nodes = this.currentNodes();
    return nodes.length > 0 && nodes[0].children.length > 0;
  });

  protected currentLevelLabel = computed(() => {
    const nodes = this.currentNodes();
    if (nodes.length === 0) return 'Selecciona una categoría principal';
    const p = this.currentPath();
    if (p.length === 0) return 'Categoría principal:';
    const leafCount = this.countLeaves(nodes);
    return `Nivel ${p.length} — ${leafCount} opciones disponibles`;
  });

  protected hsName(node: HsNode | HsSearchResult | { code: string; name: string }): string {
    if (!node || !('code' in node)) return '';
    const c = node.code;
    if (!c) return node.name;
    return this.hsService.getSpanishName(c) || node.name;
  }

  private countLeaves(nodes: HsNode[]): number {
    if (nodes.length === 0) return 0;
    return nodes.reduce((sum, n) => sum + (n.children.length > 0 ? this.countLeaves(n.children) : 1), 0);
  }

  async ngOnInit() {
    await this.hsService.load();
    this.suffixes = this.hsService.getSuffixes();
    const roots = this.hsService.getRoots();
    this.currentNodes.set(roots);
    this.loading.set(false);

    if (this.data?.initialCode) {
      const node = this.hsService.getNode(this.data.initialCode);
      if (node) {
        const path = this.hsService.getPath(node.code);
        this.history.set(path);
        const children = node.children;
        this.currentNodes.set(children);
        this.level.set(path.length);
      }
    }
  }

  selectNode(node: HsNode) {
    this.history.update(h => [...h, node]);
    this.currentNodes.set(node.children);
    this.level.update(l => l + 1);
  }

  goToLevel(index: number) {
    if (index === 0) {
      this.history.set([]);
      this.currentNodes.set(this.hsService.getRoots());
      this.level.set(0);
    } else {
      const path = this.history().slice(0, index);
      this.history.set(path);
      const last = path[path.length - 1];
      this.currentNodes.set(last.children);
      this.level.set(index);
    }
  }

  onSearch() {
    const q = this.searchQuery();
    if (q.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searchResults.set(this.hsService.search(q));
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  selectSearchResult(result: HsSearchResult) {
    const node = this.hsService.getNode(result.code);
    if (node) {
      const path = this.hsService.getPath(result.code);
      this.history.set(path);
      this.currentNodes.set(node.children);
      this.level.set(path.length);
      this.clearSearch();
    }
  }

  accept() {
    this.dialogRef.close(this.fullCode());
  }
}
