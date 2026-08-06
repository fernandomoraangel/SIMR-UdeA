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
  of,
  EMPTY,
} from 'rxjs';
import {
  tap,
  catchError,
  switchMap,
  map,
  shareReplay,
  filter,
} from 'rxjs/operators';
import { Router } from '@angular/router';

// import { environment } from '../../environments/environment';
import { environment } from '@env/environment';
import {
  User,
  LoginResponse,
  AuthVerifyResponse,
  SignupCredentials,
  SignupResponse,
  // LoginCredentials,
  AuthState,
} from './auth.interface';

export interface AuthStateExtended extends AuthState {
  isInitialized: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Estado extendido con información de inicialización
  private authStateSubject = new BehaviorSubject<AuthStateExtended>({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    isLoading: false,
  });

  // Observable público para el estado completo
  public authState$ = this.authStateSubject.asObservable();

  // Observables derivados para casos específicos
  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated)
  );

  public user$ = this.authState$.pipe(map((state) => state.user));

  public isInitialized$ = this.authState$.pipe(
    map((state) => state.isInitialized)
  );

  public isLoading$ = this.authState$.pipe(map((state) => state.isLoading));

  // Observable que emite solo cuando el servicio está inicializado
  public ready$ = this.authState$.pipe(
    filter((state) => state.isInitialized),
    shareReplay(1)
  );

  private refreshTimer: any;
  private initializationPromise: Promise<void> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // No inicializar automáticamente para evitar dependencia circular
  }

  /**
   * Inicializar el servicio de autenticación
   * Solo debe llamarse UNA VEZ al inicio de la aplicación
   */
  public init(): Promise<void> {
    if (this.authStateSubject.value.isInitialized) {
      return Promise.resolve();
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeAuth();
    return this.initializationPromise;
  }

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  private async initializeAuth(): Promise<void> {
    console.log('🔄 Inicializando AuthService...');

    this.updateAuthState({ isLoading: true });

    try {
      // Verificar si hay una sesión activa
      const response = await firstValueFrom(this.verifyAuthInternal());

      if (response.success && response.data.user) {
        this.setAuthState(response.data.user);
        console.log('✅ Usuario autenticado:', response.data.user.username);
      } else {
        this.clearAuthState();
        console.log('❌ No hay sesión activa');
      }
    } catch (error) {
      console.log('⚠️ Error al verificar, intentando refresh...');

      try {
        await firstValueFrom(this.refreshToken());
        console.log('✅ Sesión restaurada via refresh token');
      } catch (refreshError) {
        console.log('❌ No se pudo restaurar la sesión');
        this.clearAuthState();
      }
    } finally {
      this.updateAuthState({
        isLoading: false,
        isInitialized: true,
      });
      console.log('🎉 AuthService inicializado');
    }
  }

  /**
   * Verificación interna (privada) - NO usar en componentes
   */
  private verifyAuthInternal(): Observable<AuthVerifyResponse> {
    return this.http
      .get<AuthVerifyResponse>(`${this.API_URL}/verify`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          console.log(
            '🔍 Verificación interna:',
            response.success ? '✅' : '❌'
          );
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verificación pública (solo para casos específicos como guards)
   * Los componentes NO deberían usar esto directamente
   */
  public verifyAuth(): Observable<AuthVerifyResponse> {
    return this.verifyAuthInternal().pipe(
      tap((response) => {
        if (response.success && response.data.user) {
          this.setAuthState(response.data.user);
        } else {
          this.clearAuthState();
        }
      })
    );
  }

  /**
   * Obtener el estado actual de forma síncrona
   */
  public getCurrentAuthState(): AuthStateExtended {
    return this.authStateSubject.value;
  }

  /**
   * Esperar a que el servicio esté listo
   */
  public waitForReady(): Observable<AuthStateExtended> {
    return this.ready$;
  }

  /**
   * Registrar usuario
   */
  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    this.updateAuthState({ isLoading: true });

    return this.http
      .post<SignupResponse>(`${this.API_URL}/signup`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (
            response.success &&
            response.data.user &&
            response.data.tokenInfo
          ) {
            this.setAuthState(response.data.user);
            this.scheduleTokenRefresh(response.data.tokenInfo.expiresIn);
          }
          this.updateAuthState({ isLoading: false });
        }),
        catchError((error) => {
          this.updateAuthState({ isLoading: false });
          return this.handleError(error);
        })
      );
  }

  /**
   * Iniciar sesión
   */
  login(username: string, password: string): Observable<LoginResponse> {
    this.updateAuthState({ isLoading: true });

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          if (
            response.success &&
            response.data.user &&
            response.data.tokenInfo
          ) {
            this.setAuthState(response.data.user);
            console.log(
              '(auth.service.ts) Expiration in seconds:',
              response.data.tokenInfo.expiresIn
            );
            this.scheduleTokenRefresh(response.data.tokenInfo.expiresIn);
          }
          this.updateAuthState({ isLoading: false });
        }),
        catchError((error) => {
          this.updateAuthState({ isLoading: false });
          return this.handleError(error);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    this.updateAuthState({ isLoading: true });

    return this.http
      .post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearAuthState();
          this.clearRefreshTimer();
          this.updateAuthState({ isLoading: false });
        }),
        catchError((error) => {
          // Limpiar estado local incluso si falla la llamada al servidor
          this.clearAuthState();
          this.clearRefreshTimer();
          this.updateAuthState({ isLoading: false });
          return this.handleError(error);
        })
      );
  }

  /**
   * Actualizar token de acceso
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          console.log('Refresh token response:', response);
          if (response.success && response.data.tokenInfo) {
            const currentUser = this.authStateSubject.value.user;
            if (currentUser) {
              this.scheduleTokenRefresh(response.data.tokenInfo.expiresIn);
            }
          }
        }),
        catchError((error) => {
          console.error('❌ Error al refrescar token:', error);
          this.clearAuthState();
          throw error;
        })
      );
  }

  /**
   * Establecer estado de autenticación
   */
  private setAuthState(user: User): void {
    this.updateAuthState({
      user,
      isAuthenticated: true,
    });
  }

  /**
   * Limpiar estado de autenticación
   */
  private clearAuthState(): void {
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
    });
    this.clearRefreshTimer();
  }

  /**
   * Actualizar estado parcialmente
   */
  private updateAuthState(partialState: Partial<AuthStateExtended>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      ...partialState,
    });
  }

  /**
   * Programar refresh automático del token
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimer();

    const refreshBeforeInSeconds = 2 * 60; // 2 minutos antes de expirar
    const refreshTime = Math.max(
      0,
      (expiresIn - refreshBeforeInSeconds) * 1000
    );

    if (refreshTime > 0) {
      console.log(`🔄 Programando refresh en ${refreshTime / 1000} segundos`);

      this.refreshTimer = timer(refreshTime)
        .pipe(
          switchMap(() => this.refreshToken()),
          catchError((error) => {
            console.error('❌ Error en refresh automático:', error);
            this.clearAuthState();
            return EMPTY;
          })
        )
        .subscribe();
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

  /**
   * Métodos de conveniencia
   */
  redirectToAngularJS(): void {
    if (this.isAuthenticated()) {
      // Usar URL dinámica en lugar de hardcodeada
      const angularJSUrl = this.getAngularJSUrl();
      window.location.href = angularJSUrl;
    }
  }

  redirectToLegacyApp(): void {
    if (this.isAuthenticated()) {
      window.location.href = this.API_URL.replace('/api/auth', '');
    }
  }

  private getAngularJSUrl(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        return 'http://localhost:3000';
      } else {
        // En producción, asumir que AngularJS está en el mismo dominio o subdominio
        return (
          window.location.protocol +
          '//' +
          hostname.replace('frontend', 'legacy')
        );
      }
    }
    return 'http://localhost:3000';
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

/**
     * Manejo de errores
     */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      const serverError = error.error?.message || 'Error desconocido';

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
          errorMessage = serverError;
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Código: ${error.status}, Mensaje: ${serverError}`;
      }
    }

    console.error('❌ Error en AuthService:', errorMessage);

    // Crear un nuevo error con mensaje legible
    const enhancedError: any = new Error(errorMessage);
    enhancedError.status = error.status;
    enhancedError._authMessage = errorMessage;
    enhancedError.originalError = error.error;
    return throwError(() => enhancedError);
  }

  /**
   * Test methods
   */
  testGetAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`http://localhost:3000/api/users`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  testGetAllActores(): Observable<[]> {
    return this.http
      .get<[]>('http://localhost:3000/api/actores', {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
