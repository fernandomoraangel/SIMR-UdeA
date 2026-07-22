import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Idioma,
  CreateIdiomaRequest,
  UpdateIdiomaRequest,
} from '../domain/idioma.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class IdiomasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/idiomas`;

  getAll(): Observable<Idioma[]> {
    return this.http.get<Idioma[]>(this.API_URL);
  }

  getById(id: string): Observable<Idioma> {
    return this.http.get<Idioma>(`${this.API_URL}/${id}`);
  }

  create(idioma: CreateIdiomaRequest): Observable<Idioma> {
    return this.http.post<Idioma>(this.API_URL, idioma);
  }

  update(id: string, idioma: UpdateIdiomaRequest): Observable<Idioma> {
    return this.http.put<Idioma>(`${this.API_URL}/${id}`, idioma);
  }

  delete(id: string): Observable<Idioma> {
    return this.http.delete<Idioma>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Idioma[]> {
    return this.http.get<Idioma[]>(`${this.API_URL}?idioma=${encodeURIComponent(term)}`);
  }

  seed(): Observable<{ message: string; creadas: number; existentes: number; errores: number }> {
    return this.http.post<{ message: string; creadas: number; existentes: number; errores: number }>(
      `${this.API_URL}/seed`,
      {}
    );
  }
}
