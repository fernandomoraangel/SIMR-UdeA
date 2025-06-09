import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor2 implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Obtener el token
    const token = this.authService.getToken();

    // Si hay un token, agregarlo a los headers
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Continuar con la solicitud
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router.navigate(['/asdfag']);
        // Si hay un error de autenticación (401), redirigir al login
        if (error.status === 401) {
          this.authService.logout();
          // this.router.navigate(['/signin']);
        }
        return throwError(() => error);
      })
    );
  }
}
