import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sistema, CreateSistemaRequest, UpdateSistemaRequest } from '../domain/sistema.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SistemasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/sistemas`;

  getAll(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.API_URL);
  }

  getById(id: string): Observable<Sistema> {
    return this.http.get<Sistema>(`${this.API_URL}/${id}`);
  }

  create(data: CreateSistemaRequest): Observable<Sistema> {
    return this.http.post<Sistema>(this.API_URL, data);
  }

  update(id: string, data: UpdateSistemaRequest): Observable<Sistema> {
    return this.http.put<Sistema>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Sistema> {
    return this.http.delete<Sistema>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
