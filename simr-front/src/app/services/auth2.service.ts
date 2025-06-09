import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class AuthService2 {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Verificar token al iniciar
    this.verifyToken().subscribe();
  }

  // Obtener el usuario actual
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Iniciar sesión
  login(username: string, password: string): Observable<AuthResponse> {
    console.log('loginService', username, password);
    return this.http
      .post<AuthResponse>(`${base_url}/api/auth/signin`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));

          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  // Registrar usuario
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${base_url}/api/auth/signup`, userData).pipe(
      tap((response) => {
        // Almacenar token y datos de usuario
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));

        // Actualizar el BehaviorSubject
        this.currentUserSubject.next(response.user);
      })
    );
  }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http.get(`${base_url}/api/auth/signout`).pipe(
      tap(() => {
        // Eliminar token y datos de usuario del almacenamiento
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);

        // Actualizar el BehaviorSubject
        this.currentUserSubject.next(null);
      })
    );
  }

  // Verificar si el token es válido
  verifyToken(): Observable<any> {
    const token = this.getToken();

    if (!token) {
      // Si no hay token, no hacer nada
      return new Observable((observer) => {
        observer.next({ valid: false });
        observer.complete();
      });
    }

    // Configurar headers con el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${base_url}/api/auth/verify`, { headers }).pipe(
      tap((response) => {
        if (!response.valid) {
          // Si el token no es válido, limpiar storage
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem(this.userKey);
          this.currentUserSubject.next(null);
        } else if (response.user) {
          // Actualizar datos de usuario si cambiaron
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Método centralizado para manejar errores HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      const serverError = error.error?.message || 'Error desconocido';
      errorMessage = `Código: ${error.status}, Mensaje: ${serverError}`;

      // Manejo específico según código de estado
      switch (error.status) {
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
      }
    }

    // Registrar el error para debugging
    console.error('Error en la autenticación:', errorMessage);

    // Devolver un observable con un error amigable
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
    }));
  }

  // Obtener datos de usuario del localStorage
  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }
}
