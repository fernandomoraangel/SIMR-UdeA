import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Coleccion,
  CreateColeccionRequest,
  UpdateColeccionRequest,
} from '../domain/coleccion.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ColeccionesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/colecciones`;

  getAll(): Observable<Coleccion[]> {
    return this.http.get<Coleccion[]>(this.API_URL);
  }

  getById(id: string): Observable<Coleccion> {
    return this.http.get<Coleccion>(`${this.API_URL}/${id}`);
  }

  create(data: CreateColeccionRequest): Observable<Coleccion> {
    return this.http.post<Coleccion>(this.API_URL, data);
  }

  update(id: string, data: UpdateColeccionRequest): Observable<Coleccion> {
    return this.http.put<Coleccion>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Coleccion> {
    return this.http.delete<Coleccion>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Coleccion[]> {
    return this.http.get<Coleccion[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
