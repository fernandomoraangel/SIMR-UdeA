import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Actor } from '../models/actor.interface';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ActoresService {
  private readonly API_URL = `${environment.apiUrl}/actores`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Get all actors
  getActores(): Observable<Actor[]> {
    return this.http
      .get<Actor[]>(this.API_URL)
      .pipe(catchError(this.errorHandler.handleError));
  }

  // Get actor by ID
  getActorById(id: string): Observable<Actor> {
    const url = `${this.API_URL}/${id}`;
    return this.http.get<Actor>(url).pipe(
      // catchError(handleError<Actor>(`getActor id=${id}`))
      catchError(this.errorHandler.handleError)
    );
  }

  // Create a new actor
  addActor(actor: Actor): Observable<Actor> {
    actor.creado = new Date(); // Asignar la fecha actual
    return this.http
      .post<Actor>(this.API_URL, actor, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        // catchError(handleError<Actor>('addActor'))
        catchError(this.errorHandler.handleError)
      );
  }

  // Update an existing actor
  updateActor(id: string, actor: Actor): Observable<any> {
    const url = `${this.API_URL}/${id}`;
    return this.http.put(url, actor).pipe(
      // catchError(handleError<any>('updateActor'))
      catchError(this.errorHandler.handleError)
    );
  }

  // Delete an actor
  deleteActor(id: string): Observable<Actor> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<Actor>(url).pipe(
      // catchError(handleError<Actor>('deleteActor'))
      catchError(this.errorHandler.handleError)
    );
  }
}
