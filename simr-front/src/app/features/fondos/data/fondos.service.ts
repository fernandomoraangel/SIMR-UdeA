import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fondo, CreateFondoRequest, UpdateFondoRequest } from '../domain/fondo.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class FondosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/fondos`;

  getAll(): Observable<Fondo[]> {
    return this.http.get<Fondo[]>(this.API_URL);
  }

  getById(id: string): Observable<Fondo> {
    return this.http.get<Fondo>(`${this.API_URL}/${id}`);
  }

  create(data: CreateFondoRequest): Observable<Fondo> {
    return this.http.post<Fondo>(this.API_URL, data);
  }

  update(id: string, data: UpdateFondoRequest): Observable<Fondo> {
    return this.http.put<Fondo>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Fondo> {
    return this.http.delete<Fondo>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Fondo[]> {
    return this.http.get<Fondo[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
