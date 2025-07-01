import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  throwError,
  timer,
  firstValueFrom,
} from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import {
  User,
  LoginResponse,
  AuthVerifyResponse,
  SignupCredentials,
  SignupResponse,
  // LoginCredentials,
  AuthState,
} from '../interfaces/auth.interface';

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

  // private currentUserSubject = new BehaviorSubject<User | null>(null);
  // public currentUser$ = this.currentUserSubject.asObservable();

  // private accessToken: string | null = null;
  // private isRefreshing = false;
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

  verifyAuth(): Observable<AuthVerifyResponse> {
    return this.http
      .get<AuthVerifyResponse>(`${this.BASE_URL}/verify`, {
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

  // Registrar usuario
  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    // Limpiar cualquier sesión previa
    this.clearAuthState();

    // Enviar solicitud de registro
    return this.http
      .post<SignupResponse>(`${this.BASE_URL}/signup`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.tokens) {
            // Si el registro incluye login automático
            this.setAuthState(response.user, response.tokens.accessToken);
            this.scheduleTokenRefresh(response.tokens.expiresIn);
          }
          // Si requiere verificación de email, no establecer auth state
        }),
        catchError(this.handleError)
      );
  }

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
          this.clearAuthState();
          this.clearRefreshTimer();
          // this.router.navigate(['/login']); // TODO: Cambiar a la ruta de inicio
        }),
        catchError(this.handleError)
      );
  }

  // Actualizar token
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

  // Redirigir a aplicación AngularJS
  redirectToLegacyApp(): void {
    // Verificar que el usuario esté autenticado
    if (this.isAuthenticated()) {
      // Redirigir al endpoint que maneja la redirección
      window.location.href = `${this.BASE_URL}/redirect-to-legacy`;
    } else {
      console.error('Usuario no autenticado');
    }
  }

  // Verificar si el usuario está autenticado
  private setAuthState(user: User, accessToken: string | null): void {
    this.authStateSubject.next({
      user,
      isAuthenticated: true,
      accessToken,
    });
  }

  // Limpiar estado de autenticación
  private clearAuthState(): void {
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      accessToken: null,
    });
    this.clearRefreshTimer();
  }

  // Programar temporadizador del refresh token
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

  // Limpiar el temporizador de refresh
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

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  // Obtener el token de acceso actual
  getAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  // Método centralizado para manejar errores HTTP
  private handleError1(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error: ${error.status}`;
    }

    console.error('Error en AuthService:', errorMessage);
    return throwError(() => errorMessage);
  }

  //! (former code) // Método centralizado para manejar errores HTTP
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
    console.error('Error en AuthService:', errorMessage);
    return throwError(() => errorMessage);
  }
  //! End of former code
}
