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
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  // Caso 1: URLs que NUNCA deben tener Authorization header
  private readonly excludedUrls = [
    '/login',
    '/signup',
    // '/forgot-password',
    // '/reset-password',
  ];

  // Caso 2: URLs que usan refresh token, no access token
  private readonly refreshOnlyUrls = ['/refresh', '/logout', '/verify'];

  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // URLs que nunca deben tener Authorization header
    if (this.shouldExcludeUrl(req.url)) {
      return next.handle(req);
    }

    // Para URLs que solo usan refresh token (en cookies)
    if (this.isRefreshOnlyUrl(req.url)) {
      return next.handle(req.clone({ withCredentials: true }));
    }

    // Para URLs normales, agregar access token si existe (token + cookies)
    const token = this.authService.getAccessToken();
    if (token) {
      req = this.addTokenToRequest(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          return this.handleAuthError(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldExcludeUrl(url: string): boolean {
    return this.excludedUrls.some((excludedUrl) => url.includes(excludedUrl));
  }

  private isRefreshOnlyUrl(url: string): boolean {
    return this.refreshOnlyUrls.some((refreshUrl) => url.includes(refreshUrl));
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private addToken1(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();

    let modifiedRequest = request.clone({
      withCredentials: true,
    });

    if (token) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return modifiedRequest;
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
          if (response?.success && response?.tokens?.accessToken) {
            const newToken = response.tokens.accessToken;
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addTokenToRequest(request, newToken));
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

    // Si ya se está refrescando, esperar al nuevo token
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next.handle(this.addTokenToRequest(request, token!));
      })
    );
  }

  //! backup (2025-07-01) - handleAuthError
  // private handleAuthError(
  //   request: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   if (!this.isRefreshing) {
  //     this.isRefreshing = true;
  //     this.refreshTokenSubject.next(null);

  //     return this.authService.refreshToken().pipe(
  //       switchMap((response: any) => {
  //         // this.isRefreshing = false;
  //         if (response?.success && response?.tokens?.accessToken) {
  //           const newToken = response.tokens.accessToken;
  //           this.refreshTokenSubject.next(newToken);
  //           return next.handle(this.addTokenToRequest(request, newToken));
  //         }
  //         throw new Error('Token refresh failed');
  //       }),
  //       catchError((error) => {
  //         this.isRefreshing = false;
  //         this.handleRefreshError();
  //         // Si el refresh falla, redirigir al login
  //         this.authService.logout();
  //         return throwError(() => error);
  //       })
  //     );
  //   } else {
  //     return this.refreshTokenSubject.pipe(
  //       filter((token) => token != null),
  //       take(1),
  //       switchMap((jwt) => {
  //         return next.handle(this.addToken(request, jwt));
  //       })
  //     );
  //   }
  // }
  //! End of backup (2025-07-01) - handleAuthError

  private handleRefreshError(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Forzar navegación aunque el logout falle
        this.router.navigate(['/login']);
      },
    });
  }
}
