import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneroNoMusical, CreateGeneroNoMusicalRequest, UpdateGeneroNoMusicalRequest } from '../domain/genero-no-musical.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class GenerosNoMusicalesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/generos-no-musicales`;

  getAll(): Observable<GeneroNoMusical[]> {
    return this.http.get<GeneroNoMusical[]>(this.API_URL);
  }

  getById(id: string): Observable<GeneroNoMusical> {
    return this.http.get<GeneroNoMusical>(`${this.API_URL}/${id}`);
  }

  create(data: CreateGeneroNoMusicalRequest): Observable<GeneroNoMusical> {
    return this.http.post<GeneroNoMusical>(this.API_URL, data);
  }

  update(id: string, data: UpdateGeneroNoMusicalRequest): Observable<GeneroNoMusical> {
    return this.http.put<GeneroNoMusical>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<GeneroNoMusical> {
    return this.http.delete<GeneroNoMusical>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<GeneroNoMusical[]> {
    return this.http.get<GeneroNoMusical[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
