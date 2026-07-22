import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejemplar, CreateEjemplarRequest, UpdateEjemplarRequest } from '../domain/ejemplar.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EjemplaresService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/ejemplares`;

  getAll(): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(this.API_URL);
  }

  getById(id: string): Observable<Ejemplar> {
    return this.http.get<Ejemplar>(`${this.API_URL}/${id}`);
  }

  create(data: CreateEjemplarRequest): Observable<Ejemplar> {
    return this.http.post<Ejemplar>(this.API_URL, data);
  }

  update(id: string, data: UpdateEjemplarRequest): Observable<Ejemplar> {
    return this.http.put<Ejemplar>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Ejemplar> {
    return this.http.delete<Ejemplar>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(`${this.API_URL}?search=${encodeURIComponent(term)}`);
  }
}
