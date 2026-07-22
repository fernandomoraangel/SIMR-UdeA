import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Obra, CreateObraRequest, UpdateObraRequest } from '../models/obra.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ObrasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/obras`;

  getAll(): Observable<Obra[]> {
    return this.http.get<Obra[]>(this.API_URL);
  }

  getById(id: string): Observable<Obra> {
    return this.http.get<Obra>(`${this.API_URL}/${id}`);
  }

  create(data: CreateObraRequest): Observable<Obra> {
    return this.http.post<Obra>(this.API_URL, data);
  }

  update(id: string, data: UpdateObraRequest): Observable<Obra> {
    return this.http.put<Obra>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Obra> {
    return this.http.delete<Obra>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Obra[]> {
    return this.http.get<Obra[]>(`${this.API_URL}?titulo=${encodeURIComponent(term)}`);
  }
}
