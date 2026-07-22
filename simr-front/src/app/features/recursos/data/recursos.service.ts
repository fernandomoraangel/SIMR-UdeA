import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recurso, CreateRecursoRequest, UpdateRecursoRequest } from '../domain/recurso.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class RecursosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/recursos`;

  getAll(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(this.API_URL);
  }

  getById(id: string): Observable<Recurso> {
    return this.http.get<Recurso>(`${this.API_URL}/${id}`);
  }

  create(data: CreateRecursoRequest): Observable<Recurso> {
    return this.http.post<Recurso>(this.API_URL, data);
  }

  update(id: string, data: UpdateRecursoRequest): Observable<Recurso> {
    return this.http.put<Recurso>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Recurso> {
    return this.http.delete<Recurso>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.API_URL}?titulo=${encodeURIComponent(term)}`);
  }
}
