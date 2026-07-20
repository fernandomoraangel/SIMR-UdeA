import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface SearchResult {
  _id: string;
  _entityType: string;
  _searchScore: number;
  [key: string]: any;
}

export interface SearchSuggestion {
  term: string;
  for: string;
}

export interface SearchResponse {
  success: boolean;
  query?: string;
  results: SearchResult[];
  total: number;
  entities?: string[];
  exact?: boolean;
  message?: string;
  suggestion?: SearchSuggestion | null;
}

export interface SearchMetadata {
  success: boolean;
  entities: string[];
  metadata: Record<string, { searchableFields: string[] }>;
  operators: string[];
  examples: string[];
}

export interface SearchOptions {
  entities?: string[];
  fields?: string;
  exact?: boolean;
  limit?: number;
  skip?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly API = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(
    query: string,
    options: SearchOptions = {}
  ): Observable<SearchResponse> {
    const params: Record<string, string> = { q: query };
    if (options.entities && options.entities.length) {
      params['entities'] = options.entities.join(',');
    }
    if (options.fields) {
      params['fields'] = options.fields;
    }
    if (options.exact) {
      params['exact'] = 'true';
    }
    if (options.limit != null) {
      params['limit'] = String(options.limit);
    }
    if (options.skip != null) {
      params['skip'] = String(options.skip);
    }
    if (options.sort) {
      params['sort'] = options.sort;
    }
    return this.http
      .get<SearchResponse>(this.API, {
        params: params as any,
        withCredentials: true,
      })
      .pipe(
        map((res) => ({
          success: res.success,
          query: res.query,
          results: res.results || [],
          total: res.total || 0,
          entities: res.entities,
          exact: res.exact,
          message: res.message,
          suggestion: res.suggestion ?? null,
        })),
        catchError(this.handleError)
      );
  }

  getMetadata(): Observable<SearchMetadata> {
    return this.http
      .get<SearchMetadata>(`${this.API}/metadata`)
      .pipe(catchError(this.handleError));
  }

  validateQuery(query: string): Observable<any> {
    return this.http
      .get(`${this.API}/validate`, { params: { q: query }, withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error en la búsqueda.';
    if (error.error && typeof error.error.message === 'string') {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Debes iniciar sesión para buscar.';
    }
    return throwError(() => message);
  }
}
