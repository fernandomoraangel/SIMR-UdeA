import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface Lista {
  _id?: string;
  nombre_lista: string;
  elementos: string[];
  metadata?: any[];
  fecha_creacion?: string;
  fecha_modificacion?: string;
  usuario_modifico?: { username?: string; firstName?: string; lastName?: string };
}

export interface ListaElementoPayload {
  elemento: string;
  metadata?: { sigla: string; frase?: string };
}

interface WrappedResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class ListasService {
  private readonly API = `${environment.apiUrl}/listas`;

  constructor(private http: HttpClient) {}

  list(): Observable<Lista[]> {
    return this.http
      .get<Lista[]>(this.API, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  readByName(nombreLista: string): Observable<Lista> {
    return this.http
      .get<WrappedResponse<Lista>>(`${this.API}/${nombreLista}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  create(lista: Partial<Lista>): Observable<Lista> {
    return this.http
      .post<WrappedResponse<Lista>>(this.API, lista, { withCredentials: true })
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  update(listaId: string, data: Partial<Lista>): Observable<Lista> {
    return this.http
      .put<WrappedResponse<Lista>>(`${this.API}/${listaId}`, data, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  remove(listaId: string): Observable<any> {
    return this.http
      .delete<WrappedResponse<any>>(`${this.API}/${listaId}`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  addElement(
    nombreLista: string,
    payload: ListaElementoPayload
  ): Observable<Lista> {
    return this.http
      .post<WrappedResponse<Lista>>(`${this.API}/${nombreLista}/elementos`, payload, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  updateElement(
    listaId: string,
    elementoIndex: number,
    payload: ListaElementoPayload
  ): Observable<Lista> {
    return this.http
      .put<WrappedResponse<Lista>>(
        `${this.API}/${listaId}/elementos/${elementoIndex}`,
        payload,
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  deleteElement(listaId: string, elementoIndex: number): Observable<Lista> {
    return this.http
      .delete<WrappedResponse<Lista>>(
        `${this.API}/${listaId}/elementos/${elementoIndex}`,
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.data as Lista),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error al procesar la lista.';
    if (error.error && typeof error.error.message === 'string') {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Debes iniciar sesión para realizar esta acción.';
    }
    return throwError(() => message);
  }
}
