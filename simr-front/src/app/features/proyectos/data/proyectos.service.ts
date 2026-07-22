import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto, CreateProyectoRequest, UpdateProyectoRequest } from '../domain/proyecto.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/proyectos`;

  getAll(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.API_URL);
  }

  getById(id: string): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.API_URL}/${id}`);
  }

  create(data: CreateProyectoRequest): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.API_URL, data);
  }

  update(id: string, data: UpdateProyectoRequest): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Proyecto> {
    return this.http.delete<Proyecto>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
