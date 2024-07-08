import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Actor } from '../../../models/actor.model'; // Define your Actor model
import { ErrorHandlerService } from '../../../services/error-handler.service'; // Implement error handling


@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiUrl = 'http://localhost:3000/api/actores'; // URL of your Express.js API

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Get all actors
  getActores(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.apiUrl)
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  // Get actor by ID
  getActorById(id: string): Observable<Actor> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Actor>(url)
      .pipe(
        // catchError(handleError<Actor>(`getActor id=${id}`))
        catchError(this.errorHandler.handleError)
      );
  }

  // Create a new actor
  addActor(actor: Actor): Observable<Actor> {
    actor.creado = new Date(); // Asignar la fecha actual
    return this.http.post<Actor>(this.apiUrl, actor, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      // catchError(handleError<Actor>('addActor'))
      catchError(this.errorHandler.handleError)
    );
  }

  // Update an existing actor
  updateActor(id: string, actor: Actor): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, actor)
      .pipe(
        // catchError(handleError<any>('updateActor'))
        catchError(this.errorHandler.handleError)
      );
  }

  // Delete an actor
  deleteActor(id: string): Observable<Actor> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Actor>(url)
      .pipe(
        // catchError(handleError<Actor>('deleteActor'))
        catchError(this.errorHandler.handleError)
      );
  }
}
