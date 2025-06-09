import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import {
  LoginCredentials,
  AuthResponse,
  User,
} from '../interfaces/auth.interface';

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   fullName?: string;
// }

// interface AuthResponse {
//   message: string;
//   token: string;
//   user: User;
// }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL = `${environment.base_url}/api/auth`;

  // private currentUserSubject: BehaviorSubject<User | null>;
  // public currentUser: Observable<User | null>;
  // private tokenKey = 'auth_token';
  // private userKey = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;
  private refreshTimer: any;
  private isRefreshing = false;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuth();
  }

  // constructor(private http: HttpClient) {
  //   this.currentUserSubject = new BehaviorSubject<User | null>(
  //     this.getUserFromStorage()
  //   );
  //   this.currentUser = this.currentUserSubject.asObservable();

  //   // Verificar token al iniciar
  //   this.verifyToken().subscribe();
  // }

  // Iniciar sesión
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('loginService', credentials.username, credentials.password);
    return this.http
      .post<AuthResponse>(`${this.BASE_URL}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.setSession(response);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  // login2(username: string, password: string): Observable<AuthResponse> {
  //   console.log('loginService', username, password);
  //   return this.http
  //     .post<AuthResponse>(`${base_url}//signin`, { username, password })
  //     .pipe(
  //       tap((response) => {
  //         localStorage.setItem(this.tokenKey, response.token);
  //         localStorage.setItem(this.userKey, JSON.stringify(response.user));

  //         // Actualizar el BehaviorSubject
  //         this.currentUserSubject.next(response.user);
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http
      .post(
        `${this.BASE_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.clearSession();
          this.router.navigate(['/login']); // TODO: Cambiar a la ruta de inicio
        }),
        catchError((error) => {
          // Limpiar sesión aunque falle el logout del servidor
          this.clearSession();
          this.router.navigate(['/login']); // TODO: Cambiar a la ruta de inicio
          return throwError(() => error);
        })
      );
  }

  // logout2(): Observable<any> {
  //   return this.http.get(`${base_url}/api/auth/signout`).pipe(
  //     tap(() => {
  //       // Eliminar token y datos de usuario del almacenamiento
  //       localStorage.removeItem(this.tokenKey);
  //       localStorage.removeItem(this.userKey);

  //       // Actualizar el BehaviorSubject
  //       this.currentUserSubject.next(null);
  //     })
  //   );
  // }

  // Registrar usuario
  register(userData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.BASE_URL}/register`, userData)
      .pipe(
        tap((response) => {
          // // Almacenar token y datos de usuario
          // localStorage.setItem(this.tokenKey, response.token);
          // localStorage.setItem(this.userKey, JSON.stringify(response.user));

          // // Actualizar el BehaviorSubject
          // this.currentUserSubject.next(response.user);
        })
      );
  }

  // Actualizar token
  refreshToken(): Observable<AuthResponse> {
    if (this.isRefreshing) {
      // Si ya hay un refresh en progreso, esperar
      return timer(100).pipe(switchMap(() => this.refreshToken()));
    }

    this.isRefreshing = true;

    return this.http
      .post<AuthResponse>(
        `${this.BASE_URL}/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response) => {
          this.setSession(response);
          this.isRefreshing = false;
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  // Obtener el usuario actual
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.BASE_URL}/me`, {
      withCredentials: true,
    });
  }

  // public get currentUserValue(): User | null {
  //   return this.currentUserSubject.value;
  // }

  // Establecer sesión
  private setSession(authResponse: AuthResponse): void {
    this.accessToken = authResponse.accessToken;
    this.currentUserSubject.next(authResponse.user);

    // Persistir usuario para recuperación de estado
    localStorage.setItem('user', JSON.stringify(authResponse.user));

    // Programar refresh automático
    this.scheduleTokenRefresh();
  }

  // Limpiar sesión
  private clearSession(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Programar la actualización del token
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Lo actualiza 2 minutos antes de que expire (13 min para token de 15 min)
    this.refreshTimer = setTimeout(() => {
      if (this.isAuthenticated) {
        this.refreshToken().subscribe({
          error: (error) => {
            console.error('Token refresh failed:', error);
            this.handleAuthError();
          },
        });
      }
    }, 13 * 60 * 1000);
  }

  // Inicializar autenticación
  private initializeAuth(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Intentar refresh para validar la sesión
        this.refreshToken().subscribe({
          next: (response) => {
            // Sesión válida restaurada
            console.log('Session restored successfully');
          },
          error: (error) => {
            console.log('Session restoration failed:', error);
            localStorage.removeItem('user');
          },
        });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }

  // Manejar error de autenticación
  private handleAuthError(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // Getters públicos
  get isAuthenticated(): boolean {
    return !!this.accessToken && !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  hasRole(role: string): boolean {
    // return this.currentUser?.roles.includes(role) ?? false;
    return false;
  }

  hasAnyRole(roles: string[]): boolean {
    // return roles?.some((role) => this.hasRole(role)) ?? false;
    return false;
  }

  // hasRole(role: string): boolean {
  //   const user = this.currentUser;
  //   return user ? user.roles.includes(role) : false;
  // }

  // hasAnyRole(roles: string[]): boolean {
  //   const user = this.currentUser;
  //   if (!user) return false;

  //   return roles.some((role) => user.roles.includes(role));
  // }

  // =====================================================

  // // Verificar si el token es válido
  // verifyToken(): Observable<any> {
  //   const token = this.getToken();

  //   if (!token) {
  //     // Si no hay token, no hacer nada
  //     return new Observable((observer) => {
  //       observer.next({ valid: false });
  //       observer.complete();
  //     });
  //   }

  //   // Configurar headers con el token
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   return this.http.get<any>(`${base_url}/api/auth/verify`, { headers }).pipe(
  //     tap((response) => {
  //       if (!response.valid) {
  //         // Si el token no es válido, limpiar storage
  //         localStorage.removeItem(this.tokenKey);
  //         localStorage.removeItem(this.userKey);
  //         this.currentUserSubject.next(null);
  //       } else if (response.user) {
  //         // Actualizar datos de usuario si cambiaron
  //         localStorage.setItem(this.userKey, JSON.stringify(response.user));
  //         this.currentUserSubject.next(response.user);
  //       }
  //     })
  //   );
  // }

  // // Obtener token del localStorage
  // getToken(): string | null {
  //   return localStorage.getItem(this.tokenKey);
  // }

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

  // // Obtener datos de usuario del localStorage
  // private getUserFromStorage(): User | null {
  //   const userData = localStorage.getItem(this.userKey);
  //   return userData ? JSON.parse(userData) : null;
  // }

  // Verificar si el usuario está autenticado
  // isAuthenticated(): boolean {
  //   return !!this.getToken() && !!this.currentUserValue;
  // }
}
