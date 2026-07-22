import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Materia,
  CreateMateriaRequest,
  UpdateMateriaRequest,
} from '../domain/materia.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class MateriasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/materias`;

  getAll(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.API_URL);
  }

  getById(id: string): Observable<Materia> {
    return this.http.get<Materia>(`${this.API_URL}/${id}`);
  }

  create(materia: CreateMateriaRequest): Observable<Materia> {
    return this.http.post<Materia>(this.API_URL, materia);
  }

  update(id: string, materia: UpdateMateriaRequest): Observable<Materia> {
    return this.http.put<Materia>(`${this.API_URL}/${id}`, materia);
  }

  delete(id: string): Observable<Materia> {
    return this.http.delete<Materia>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
