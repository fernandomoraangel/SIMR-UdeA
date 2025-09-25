import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  // URLs que nunca deben tener cookies ni headers de auth
  private readonly excludedUrls = ['/login', '/signup'];

  // URLs que usan únicamente refresh token desde cookies
  // private readonly refreshOnlyUrls = ['/refresh', '/logout', '/verify'];

  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // No modificar solicitudes excluidas
    if (this.shouldExcludeUrl(req.url)) {
      return next.handle(req);
    }

    // Todas las demás: enviar cookies automáticamente
    const clonedRequest = req.clone({ withCredentials: true });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleAuthError(clonedRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldExcludeUrl(url: string): boolean {
    return this.excludedUrls.some((excludedUrl) => url.includes(excludedUrl));
  }

  private handleAuthError(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          if (response?.success) {
            this.refreshTokenSubject.next(true); // Solo señal, no es token
            return next.handle(request.clone({ withCredentials: true }));
          }
          throw new Error('Token refresh failed');
        }),
        catchError((error) => {
          this.handleRefreshError();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((value) => value === true),
      take(1),
      switchMap(() => next.handle(request.clone({ withCredentials: true })))
    );
  }

  private handleRefreshError(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']), // Forzar logout local
    });
  }
}