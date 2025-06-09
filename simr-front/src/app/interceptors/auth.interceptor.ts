import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Agregar token de autorización
    let authRequest = this.addToken(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error?.expired) {
          return this.handleAuthError(request, next);
        }

        return throwError(() => error);
      })
    );

    // // Obtener el token
    // const token = this.authService.getToken();

    // // Si hay un token, agregarlo a los headers
    // if (token) {
    //   request = request.clone({
    //     setHeaders: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });
    // }

    // // Continuar con la solicitud
    // return next.handle(request).pipe(
    //   catchError((error: HttpErrorResponse) => {
    //     this.router.navigate(['/asdfag']);
    //     // Si hay un error de autenticación (401), redirigir al login
    //     if (error.status === 401) {
    //       this.authService.logout();
    //       // this.router.navigate(['/signin']);
    //     }
    //     return throwError(() => error);
    //   })
    // );
  }

  private addToken(request: HttpRequest<any>): HttpRequest<any> {
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

  private handleAuthError(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(this.authService.getAccessToken());
          return next.handle(this.addToken(request));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap(() => {
          return next.handle(this.addToken(request));
        })
      );
    }
  }
}
