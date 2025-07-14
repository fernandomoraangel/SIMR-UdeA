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
import { tap, catchError, switchMap, map } from 'rxjs/operators';
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

  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated)
  );

  private refreshTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    // No inicializar automáticamente para evitar dependencia circular
  }

  /**
   * Inicializar el servicio de autenticación
   * Debe ser llamado desde AppComponent después de que todos los servicios estén listos
   */
  public init(): void {
    this.initializeAuth().catch((error) => {
      console.error('Error initializing AuthService:', error);
    });
  }

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  private async initializeAuth(): Promise<void> {
    try {
      console.log(
        '(initializeAuth) Inicializando autenticación en AuthService'
      );
      // Verificar si hay una sesión activa
      await firstValueFrom(this.verifyAuth());
    } catch (error) {
      console.error('Error al verificar autenticación al iniciar:', error);
      // Si la verificación falla, intentar refresh
      this.refreshToken().subscribe({
        error: () => {
          // Si el refresh también falla, limpiar estado
          this.clearAuthState();
        },
      });
    }
  }

  /**
   * Verificar autenticación actual
   */
  verifyAuth(): Observable<AuthVerifyResponse> {
    return this.http
      .get<AuthVerifyResponse>(`${this.BASE_URL}/verify`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          console.log('Verificación de autenticación:', response);
          if (response.success && response.data.user) {
            // Solo establecer usuario si no tenemos estado de auth
            const currentState = this.authStateSubject.value;
            if (!currentState.isAuthenticated) {
              this.setAuthState(response.data.user, null);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Registrar usuario
   */
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
          if (response.success && response.data.user && response.data.tokens) {
            // Si el registro incluye login automático
            this.setAuthState(
              response.data.user,
              response.data.tokens.accessToken
            );
            this.scheduleTokenRefresh(response.data.tokens.expiresIn);
          }
          // Si requiere verificación de email, no establecer auth state
        }),
        catchError(this.handleError.bind(this))
        // catchError(this.handleError)
      );
  }

  /**
   * Iniciar sesión
   */
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
          console.log('Login response:', response);
          if (response.success && response.data.user && response.data.tokens) {
            this.setAuthState(
              response.data.user,
              response.data.tokens.accessToken
            );
            console.log(
              '(auth.service.ts) Expiration in seconds:',
              response.data.tokens.expiresIn
            );
            this.scheduleTokenRefresh(response.data.tokens.expiresIn);
          }
        }),
        catchError(this.handleError.bind(this))
        // catchError(this.handleError)
      );
  }

  // Cerrar sesión
  logout(): Observable<any> {
    return this.http
      .post(`${this.BASE_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearAuthState();
          this.clearRefreshTimer();
          // this.router.navigate(['/login']); // TODO: Cambiar a la ruta de inicio
        }),
        catchError(this.handleError.bind(this))
        // catchError(this.handleError)
      );
  }

  /**
   * Actualizar token de acceso
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.BASE_URL}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          console.log('Refresh token response:', response);
          if (response.success && response.data.tokens) {
            // Solo actualizar el token, mantener el usuario actual
            const currentState = this.authStateSubject.value;
            if (currentState.user) {
              this.setAuthState(
                currentState.user,
                response.data.tokens.accessToken
              );
              this.scheduleTokenRefresh(response.data.tokens.expiresIn);
            }
          }
        }),
        catchError((error) => {
          console.error('Error al refrescar token:', error);
          this.clearAuthState();
          throw error;
        })
      );
  }

  /**
   * Redirigir a aplicación AngularJS legacy
   */
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

  /**
   * Limpiar estado de autenticación
   */
  private clearAuthState(): void {
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      accessToken: null,
    });
    this.clearRefreshTimer();
  }

  /**
   * Programar refresh automático del token
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimer();

    console.log(`Programando refresh automático en ${expiresIn} segundos`);

    const refreshBeforeInSeconds = 2 * 60; // 2 minutos antes de expirar

    // Refresh 2 minutos antes de expirar
    const refreshTime = (expiresIn - refreshBeforeInSeconds) * 1000;
    // const refreshTime = 5 * 1000; // 5 segundos para pruebas

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

  /**
   * Limpiar temporizador de refresh
   */
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
      window.location.href = 'http://localhost:3000'; // Cambia por tu URL de AngularJS
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

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
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
        case 422:
          errorMessage = serverError; // Errores de validación
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Código: ${error.status}, Mensaje: ${serverError}`;
      }
    }

    console.error('Error en AuthService:', errorMessage);
    return throwError(() => errorMessage);
  }

  //! (former code) // Método centralizado para manejar errores HTTP
  // private handleError(error: HttpErrorResponse) {
  //   let errorMessage = '';

  //   if (error.error instanceof ErrorEvent) {
  //     // Error del lado del cliente
  //     errorMessage = `Error: ${error.error.message}`;
  //   } else {
  //     // Error del backend
  //     const serverError = error.error?.message || 'Error desconocido';
  //     errorMessage = `Código: ${error.status}, Mensaje: ${serverError}`;

  //     // Manejo específico según código de estado
  //     switch (error.status) {
  //       case 401:
  //         errorMessage = 'Credenciales inválidas';
  //         break;
  //       case 403:
  //         errorMessage = 'Acceso prohibido';
  //         break;
  //       case 404:
  //         errorMessage = 'Recurso no encontrado';
  //         break;
  //       case 500:
  //         errorMessage = 'Error del servidor';
  //         break;
  //     }
  //   }
  //   console.error('Error en AuthService:', errorMessage);
  //   return throwError(() => errorMessage);
  // }
  //! End of former code

  // Test Area
  testGetAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`http://localhost:3000/api/users`, {
        withCredentials: true,
      })
      .pipe(
        tap((users) => {
          console.log('Usuarios obtenidos:', users);
        }),
        catchError(this.handleError.bind(this))
      );
  }
  // End of Test Area
}
