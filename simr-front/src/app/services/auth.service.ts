import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer, firstValueFrom } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import {
  User,
  LoginResponse,
  // LoginCredentials,
  AuthState,
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

// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   user?: User;
//   tokens?: {
//     accessToken: string;
//     expiresIn: number;
//   };
// }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL = `${environment.base_url}/api/auth`;

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    accessToken: null,
  });

  public authState$ = this.authStateSubject.asObservable();
  private refreshTimer: any;

  //! former code below
  // private currentUserSubject: BehaviorSubject<User | null>;
  // public currentUser: Observable<User | null>;
  // private tokenKey = 'auth_token';
  // private userKey = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;
  private isRefreshing = false;
  //! end of former code


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

  // Inicializar autenticación
  private async initializeAuth(): Promise<void> {
    try {
      // Verificar si hay una sesión activa
      await firstValueFrom(this.verifyAuth());
    } catch (error) {
      // Si la verificación falla, intentar refresh
      this.refreshToken().subscribe({
        error: () => {
          // Si el refresh también falla, limpiar estado
          this.clearAuthState();
        },
      });
    }
  }

  //! (Former code) // Inicializar autenticación
  //   private initializeAuth(): void {
  //     const storedUser = localStorage.getItem('user');

  //     if (storedUser) {
  //       try {
  //         const user = JSON.parse(storedUser);

  //         // Intentar refresh para validar la sesión
  //         this.refreshToken().subscribe({
  //           next: (response) => {
  //             // Sesión válida restaurada
  //             console.log('Session restored successfully');
  //           },
  //           error: (error) => {
  //             console.log('Session restoration failed:', error);
  //             localStorage.removeItem('user');
  //           },
  //         });
  //       } catch (error) {
  //         localStorage.removeItem('user');
  //       }
  //     }
  //   }

  //   // Manejar error de autenticación
  //   private handleAuthError(): void {
  //     this.clearSession();
  //     this.router.navigate(['/login']);
  //   }
  //! End of former code

  // Iniciar sesión
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.BASE_URL}/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.tokens) {
            this.setAuthState(response.user, response.tokens.accessToken);
            this.scheduleTokenRefresh(response.tokens.expiresIn);
          }
        }),
        catchError(this.handleError)
      );
  }

  //! (former code) // Iniciar sesión
  // login1(credentials: LoginCredentials): Observable<AuthResponse> {
  //   console.log('loginService', credentials.username, credentials.password);
  //   return this.http
  //     .post<AuthResponse>(`${this.BASE_URL}/login`, credentials, {
  //       withCredentials: true,
  //     })
  //     .pipe(
  //       tap((response) => {
  //         this.setSession(response);
  //       }),
  //       catchError((error) => {
  //         console.error('Login error:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }
  //! End of former code

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
          this.clearAuthState();
          this.clearRefreshTimer();
        }),
        catchError(this.handleError)
      );
  }

  //! (former code) // Cerrar sesión
  logout1(): Observable<any> {
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
  //! End of former code

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

  refreshToken(): Observable<any> {
    return this.http
      .post<LoginResponse>(
        `${this.BASE_URL}/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response) => {
          if (response.success && response.tokens) {
            // Solo actualizar el token, mantener el usuario actual
            const currentState = this.authStateSubject.value;
            if (currentState.user) {
              this.setAuthState(currentState.user, response.tokens.accessToken);
              this.scheduleTokenRefresh(response.tokens.expiresIn);
            }
          }
        }),
        catchError((error) => {
          this.clearAuthState();
          throw error;
        })
      );
  }

  //! (former code) // Actualizar token
  refreshToken1(): Observable<AuthResponse> {
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
  //! End of former code

  verifyAuth(): Observable<any> {
    return this.http
      .get<{ success: boolean; user: User }>(`${this.BASE_URL}/verify`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            // Solo establecer usuario si no tenemos estado de auth
            const currentState = this.authStateSubject.value;
            if (!currentState.isAuthenticated) {
              this.setAuthState(response.user, null);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  private setAuthState(user: User, accessToken: string | null): void {
    this.authStateSubject.next({
      user,
      isAuthenticated: true,
      accessToken,
    });
  }

  private clearAuthState(): void {
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      accessToken: null,
    });
    this.clearRefreshTimer();
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimer();

    // Programar refresh 2 minutos antes de que expire
    const refreshTime = (expiresIn - 120) * 1000;

    if (refreshTime > 0) {
      this.refreshTimer = timer(refreshTime)
        .pipe(switchMap(() => this.refreshToken()))
        .subscribe({
          error: (error) => {
            console.error('Error en refresh automático:', error);
            this.clearAuthState();
          },
        });
    }
  }

  //! (former code) Programar la actualización del token
  private scheduleTokenRefresh1(): void {
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
  //! End of former code

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  // Método para redireccionar a AngularJS
  redirectToAngularJS(): void {
    // Asegurar que el usuario esté autenticado
    const currentState = this.authStateSubject.value;
    if (currentState.isAuthenticated) {
      // Redireccionar a la aplicación AngularJS
      window.location.href = 'http://localhost:8080'; // Cambia por tu URL de AngularJS
    } else {
      console.error('Usuario no autenticado');
    }
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get isAuthenticated1(): boolean {
    return !!this.accessToken && !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  //! (former code) // Obtener el usuario actual
  getCurrentUser1(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.BASE_URL}/me`, {
      withCredentials: true,
    });
  }
  //! End of former code

  getAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  //! (former code)
  getAccessToken1(): string | null {
    return this.accessToken;
  }
  //! End of former code

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error: ${error.status}`;
    }
    
    console.error('Error en AuthService:', errorMessage);
    return throwError(errorMessage);
  }

   //! (former code) // Método centralizado para manejar errores HTTP
  private handleError1(error: HttpErrorResponse) {
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
    //! End of former code

  //! FORMER CODE BELOW

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

  // Getters públicos
  // get isAuthenticated1(): boolean {
  //   return !!this.accessToken && !!this.currentUserSubject.value;
  // }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // getAccessToken(): string | null {
  //   return this.accessToken;
  // }

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
