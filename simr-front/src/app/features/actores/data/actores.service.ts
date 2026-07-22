import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Actor } from '../models/actor.interface';

@Injectable({ providedIn: 'root' })
export class ActoresService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/actores`;

  getAll(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.API_URL);
  }

  getById(id: string): Observable<Actor> {
    return this.http.get<Actor>(`${this.API_URL}/${id}`);
  }

  create(data: Partial<Actor>): Observable<Actor> {
    return this.http.post<Actor>(this.API_URL, data);
  }

  update(id: string, data: Partial<Actor>): Observable<Actor> {
    return this.http.put<Actor>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Actor> {
    return this.http.delete<Actor>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Actor[]> {
    return this.http.get<Actor[]>(`${this.API_URL}?fullName=${encodeURIComponent(term)}`);
  }
}
