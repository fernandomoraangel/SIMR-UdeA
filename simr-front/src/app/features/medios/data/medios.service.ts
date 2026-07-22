import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Medio,
  CreateMedioRequest,
  UpdateMedioRequest,
} from '../domain/medio.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class MediosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/medios`;

  getAll(): Observable<Medio[]> {
    return this.http.get<Medio[]>(this.API_URL);
  }

  getById(id: string): Observable<Medio> {
    return this.http.get<Medio>(`${this.API_URL}/${id}`);
  }

  create(medio: CreateMedioRequest): Observable<Medio> {
    return this.http.post<Medio>(this.API_URL, medio);
  }

  update(id: string, medio: UpdateMedioRequest): Observable<Medio> {
    return this.http.put<Medio>(`${this.API_URL}/${id}`, medio);
  }

  delete(id: string): Observable<Medio> {
    return this.http.delete<Medio>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Medio[]> {
    return this.http.get<Medio[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
