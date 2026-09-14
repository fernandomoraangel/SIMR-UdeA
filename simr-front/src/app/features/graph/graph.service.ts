import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { GraphApiResponse, GraphMetadataResponse } from './graph.interface';

@Injectable({ providedIn: 'root' })
export class GraphService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/graph`;

  getGraphData(options: { entities?: string[]; query?: string | null; limit?: number } = {}): Observable<GraphApiResponse> {
    let params = new HttpParams();
    if (options.entities?.length) params = params.set('entities', options.entities.join(','));
    if (options.query) params = params.set('query', options.query);
    if (options.limit) params = params.set('limit', options.limit);
    return this.http.get<GraphApiResponse>(`${this.apiUrl}/data`, { params });
  }

  getMetadata(): Observable<GraphMetadataResponse> {
    return this.http.get<GraphMetadataResponse>(`${this.apiUrl}/metadata`);
  }
}
