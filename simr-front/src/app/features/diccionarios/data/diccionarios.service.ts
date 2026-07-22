import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Diccionario,
  CreateDiccionarioRequest,
  UpdateDiccionarioRequest,
} from '../domain/diccionario.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class DiccionariosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/diccionarios`;

  getAll(): Observable<Diccionario[]> {
    return this.http.get<Diccionario[]>(this.API_URL);
  }

  getById(id: string): Observable<Diccionario> {
    return this.http.get<Diccionario>(`${this.API_URL}/${id}`);
  }

  create(diccionario: CreateDiccionarioRequest): Observable<Diccionario> {
    return this.http.post<Diccionario>(this.API_URL, diccionario);
  }

  update(id: string, diccionario: UpdateDiccionarioRequest): Observable<Diccionario> {
    return this.http.put<Diccionario>(`${this.API_URL}/${id}`, diccionario);
  }

  delete(id: string): Observable<Diccionario> {
    return this.http.delete<Diccionario>(`${this.API_URL}/${id}`);
  }

  search(term: string): Observable<Diccionario[]> {
    return this.http.get<Diccionario[]>(`${this.API_URL}?nombre=${encodeURIComponent(term)}`);
  }
}
