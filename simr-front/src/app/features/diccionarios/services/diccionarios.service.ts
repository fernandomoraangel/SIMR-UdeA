import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, switchMap } from 'rxjs';
import {
  Diccionario,
  CreateDiccionarioDto,
  UpdateDiccionarioDto,
} from '../models/diccionario.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class DiccionariosService {
  private http = inject(HttpClient);
  //   private readonly baseUrl = '/api/diccionarios';
  private readonly API_URL = `${environment.apiUrl}/diccionarios`;

  // Cache simple para optimizar consultas frecuentes
  private diccionariosCache$ = new BehaviorSubject<Diccionario[]>([]);

  // Obtener todos los diccionarios
  findAll(): Observable<Diccionario[]> {
    return this.http
      .get<Diccionario[]>(this.API_URL)
      .pipe(tap((diccionarios) => this.diccionariosCache$.next(diccionarios)));
  }

  // Obtener diccionario por ID
  findOne(id: string): Observable<Diccionario> {
    return this.http.get<Diccionario>(`${this.API_URL}/${id}`);
  }

  // Crear nuevo diccionario
  create(diccionario: CreateDiccionarioDto): Observable<Diccionario> {
    return this.http.post<Diccionario>(this.API_URL, diccionario).pipe(
      tap(() => {
        // Invalidar cache para refrescar la lista
        this.refreshCache();
      })
    );
  }

  // Actualizar diccionario
  update(
    id: string,
    diccionario: Partial<UpdateDiccionarioDto>
  ): Observable<Diccionario> {
    return this.http
      .put<Diccionario>(`${this.API_URL}/${id}`, diccionario)
      .pipe(
        tap(() => {
          this.refreshCache();
        })
      );
  }

  // Eliminar diccionario
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.refreshCache();
      })
    );
  }

  private matchDiccionario(
    entries: Diccionario[],
    tabla: string,
    campo: string
  ): Diccionario | undefined {
    return entries.find(
      (d) =>
        d.tabla?.toLowerCase() === tabla.toLowerCase() &&
        d.campo?.toLowerCase() === campo.toLowerCase()
    );
  }

  getFieldHelp(tabla: string, campo: string): Observable<Diccionario | null> {
    const currentCache = this.diccionariosCache$.value;
    const found = this.matchDiccionario(currentCache, tabla, campo);
    if (found) {
      return of(found);
    }
    if (currentCache.length === 0) {
      return this.findAll().pipe(
        switchMap(() => {
          const refetched = this.matchDiccionario(
            this.diccionariosCache$.value,
            tabla,
            campo
          );
          return of(refetched || null);
        })
      );
    }
    return this.http
      .get<Diccionario[]>(`${this.API_URL}?tabla=${tabla}&campo=${campo}`)
      .pipe(
        switchMap((results) =>
          results.length > 0 ? of(results[0]) : of(null)
        )
      );
  }

  private refreshCache(): void {
    this.findAll().subscribe();
  }

  // Getter para el cache observable
  get diccionarios$(): Observable<Diccionario[]> {
    return this.diccionariosCache$.asObservable();
  }
}
