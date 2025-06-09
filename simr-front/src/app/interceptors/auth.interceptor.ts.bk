import { Injectable } from '@angular/core';
// import { HttpInterceptorFn } from '@angular/common/http';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// export const AuthInterceptor: HttpInterceptorFn = (req, next) => {  
//   return next(req);
// };

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const authToken = this.authService.getToken();
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Redirigir a la página de inicio de sesión en caso de error 401 (No autorizado)
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   constructor(private authService: AuthService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const authToken = this.authService.getToken();

//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${authToken}`
//       }
//     });

//     return next.handle(authReq);
//   }
// }
