import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SIGNIN_URL = 'http://localhost:3000/signin';
  private readonly SIGNOUT_URL = 'http://localhost:3000/signout';
  private readonly SIGNUP_URL = 'http://localhost:3000/signup';
  private signedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) { }

  signup(user: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.SIGNUP_URL, user, { headers }).pipe(
      map(response => {
        console.log('Usuario registrado:', response);
        return response;
      }),
      catchError(this.errorHandler.handleError)
    );
  }

  signin(username: string, password: string): Observable<boolean> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = `username=${username}&password=${password}`;

    // return this.http.post<any>(this.SIGNIN_URL, { username, password })
    return this.http.post(this.SIGNIN_URL, body, { headers, withCredentials: true }).pipe(
      tap(() => this.signedIn = true),
      map(response => {
        // Manejar la respuesta del servidor
        console.log('Inicio de sesión exitoso:', response);
        // if (response && response.token) {
        //   localStorage.setItem('token', response.token);
        //   return true;
        // }
        // return false;
        return true;
      }),
      // map(() => true),
      catchError(error => {
        console.error('Error en el inicio de sesión !!!', error.error.message);
        return of(false);
      })
    );
  }

  signout(): Observable<any> {
    return this.http.get(this.SIGNOUT_URL, { withCredentials: true }).pipe(
      tap(() => {
        // Manejar la respuesta de cierre de sesión aquí
        this.signedIn = false;
        this.router.navigate(['/signin']);
      })
    );
    // localStorage.removeItem('token');
  }

  // signout(): void {
  //   this.http.get(this.SIGNOUT_URL).subscribe(() => {
  //     this.signedIn = false;
  //     this.router.navigate(['/signin']);
  //   });
  //   localStorage.removeItem('token');
  // }

  // logout(): Observable<any> {
  //   return this.http.get(this.SIGNOUT_URL, { withCredentials: true }).pipe(
  //     tap(response => {
  //       // Manejar la respuesta de cierre de sesión aquí
  //     })
  //   );
  // }

  isAuthenticated(): boolean {
    // Implementar lógica para verificar si el usuario está autenticado
    // return !!localStorage.getItem('user');
    return this.signedIn;
  }
}
