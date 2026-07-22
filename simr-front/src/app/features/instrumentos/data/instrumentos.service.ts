import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Instrumento,
  CreateInstrumentoRequest,
  UpdateInstrumentoRequest,
} from '../domain/instrumento.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InstrumentosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/instrumentos`;

  getAll(): Observable<Instrumento[]> {
    return this.http.get<Instrumento[]>(this.API_URL);
  }

  getById(id: string): Observable<Instrumento> {
    return this.http.get<Instrumento>(`${this.API_URL}/${id}`);
  }

  create(data: CreateInstrumentoRequest): Observable<Instrumento> {
    return this.http.post<Instrumento>(this.API_URL, data);
  }

  update(id: string, data: UpdateInstrumentoRequest): Observable<Instrumento> {
    return this.http.put<Instrumento>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<Instrumento> {
    return this.http.delete<Instrumento>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Instrumento[]> {
    return this.http.get<Instrumento[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
