import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { SearchService, SearchResult, SearchMetadata } from './search.service';
import {
  MetadataMapperService,
  MarcField,
  DcField,
  SimrField,
} from './metadata-mapper.service';

type FormattedResult = FormattedField[];

interface FormattedField {
  tag?: string;
  subfield?: string;
  label?: string;
  element?: string;
  field?: string;
  value: string;
}

const ENTITY_ROUTE: Record<string, string> = {
  Obra: 'obras',
  Actor: 'actores',
  Recurso: 'recursos',
  Genero: 'generos',
  GeneroNoMusical: 'generosnomusicales',
  Materia: 'materias',
  Instrumento: 'instrumentos',
  Proyecto: 'proyectos',
  Medio: 'medios',
  Sistema: 'sistemas',
  Fondo: 'fondos',
  Coleccion: 'colecciones',
  Ejemplar: 'ejemplares',
  Idioma: 'idiomas',
  Diccionario: 'diccionarios',
  Archivo: 'archivos',
  Lista: 'listas',
};

const EXCLUDED_FIELDS = new Set([
  '_id',
  '__v',
  '_entityType',
  '_searchScore',
  'creado',
  'modificado',
  'created',
  'updatedAt',
  'createdAt',
  '$hashKey',
]);

const PAGE_SIZE = 20;

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSelectModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  query = '';
  entities: string[] = [];
  availableEntities: string[] = [];
  formato: 'simr' | 'marc21' | 'dublincore' = 'simr';
  showHelp = false;

  loading = false;
  error = '';
  results: SearchResult[] = [];
  total = 0;
  currentPage = 1;

  constructor(
    private searchService: SearchService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private snack: MatSnackBar,
    private mapper: MetadataMapperService
  ) {}

  ngOnInit(): void {
    this.searchService.getMetadata().subscribe({
      next: (meta: SearchMetadata) => {
        this.availableEntities = meta.entities || [];
      },
      error: () => {
        this.availableEntities = Object.keys(ENTITY_ROUTE);
      },
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / PAGE_SIZE));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectAllEntities(): void {
    this.entities = [...this.availableEntities];
  }

  clearEntities(): void {
    this.entities = [];
  }

  toggleEntity(ent: string): void {
    this.entities = this.entities.includes(ent)
      ? this.entities.filter((e) => e !== ent)
      : [...this.entities, ent];
  }

  performSearch(page = 1): void {
    if (!this.query.trim()) {
      return;
    }
    this.currentPage = page;
    this.loading = true;
    this.error = '';
    this.searchService
      .search(this.query.trim(), {
        entities: this.entities,
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      })
      .subscribe({
        next: (res) => {
          this.results = res.results || [];
          this.total = res.total || 0;
          this.loading = false;
        },
        error: (err) => {
          this.error = err;
          this.results = [];
          this.total = 0;
          this.loading = false;
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.performSearch(page);
  }

  clearSearch(): void {
    this.query = '';
    this.results = [];
    this.total = 0;
    this.error = '';
    this.currentPage = 1;
  }

  resultTitle(result: SearchResult): string {
    const keys = Object.keys(result).filter(
      (k) => !EXCLUDED_FIELDS.has(k) && !k.endsWith('id')
    );
    if (keys.length) {
      const v = result[keys[0]];
      if (typeof v === 'string' || typeof v === 'number') {
        return String(v);
      }
      if (typeof v === 'object' && v) {
        return String((v as any).nombre || (v as any).titulo || (v as any).nombres || '');
      }
    }
    return result._entityType;
  }

  resultLink(result: SearchResult): string {
    const route = ENTITY_ROUTE[result._entityType];
    if (route) {
      return `/${route}/${result._id}`;
    }
    return `/no-implementado/${(result._entityType || '').toLowerCase()}s`;
  }

  resultFields(result: SearchResult): FormattedResult {
    const populated = this.populateReferences(result);
    switch (this.formato) {
      case 'marc21':
        return this.mapper.toMARC21(populated as Record<string, any>) as FormattedField[];
      case 'dublincore':
        return this.mapper.toDublinCore(populated as Record<string, any>) as FormattedField[];
      default:
        return this.mapper.toSIMR(populated as Record<string, any>) as FormattedField[];
    }
  }

  // Poblar referencias conocidas a partir del caché local de resultados obtenidos
  private referenceCache = new Map<string, any>();

  private populateReferences(result: SearchResult): SearchResult {
    const clone: any = { ...result };
    const walk = (obj: any): any => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map(walk);
        }
        const out: any = {};
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (v && typeof v === 'object' && v._id) {
            const cached = this.referenceCache.get(v._id.toString());
            out[k] = cached ? { ...v, ...cached } : v;
          } else if (v && typeof v === 'object') {
            out[k] = walk(v);
          } else {
            out[k] = v;
          }
        }
        return out;
      }
      return obj;
    };
    return walk(clone);
  }

  highlightValue(value: string): SafeHtml {
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const q = this.query.trim();
    if (!q) {
      return this.sanitizer.bypassSecurityTrustHtml(escaped);
    }
    const terms = q
      .split(/\s+/)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(Boolean);
    if (!terms.length) {
      return this.sanitizer.bypassSecurityTrustHtml(escaped);
    }
    const re = new RegExp(`(${terms.join('|')})`, 'gi');
    return this.sanitizer.bypassSecurityTrustHtml(
      escaped.replace(re, '<mark class="search-hit">$1</mark>')
    );
  }
}
