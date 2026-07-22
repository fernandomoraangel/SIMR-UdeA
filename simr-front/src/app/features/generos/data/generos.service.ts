import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Genero, CreateGeneroRequest, UpdateGeneroRequest } from '../domain/genero.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class GenerosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/generos`;

  getAll(): Observable<Genero[]> {
    return this.http.get<Genero[]>(this.API_URL);
  }

  getById(id: string): Observable<Genero> {
    return this.http.get<Genero>(`${this.API_URL}/${id}`);
  }

  create(data: CreateGeneroRequest): Observable<Genero> {
    return this.http.post<Genero>(this.API_URL, data);
  }

  update(id: string, data: UpdateGeneroRequest): Observable<Genero> {
    return this.http.put<Genero>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Genero> {
    return this.http.delete<Genero>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
