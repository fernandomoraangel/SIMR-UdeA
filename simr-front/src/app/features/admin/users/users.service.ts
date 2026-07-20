import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { User } from '@core/models/user.model';

interface Wrapped<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http
      .get<Wrapped<User[]>>(this.API, { withCredentials: true })
      .pipe(
        map((r) => (r.data as User[]) || []),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<User> {
    return this.http
      .get<Wrapped<User>>(`${this.API}/${id}`, { withCredentials: true })
      .pipe(
        map((r) => r.data as User),
        catchError(this.handleError)
      );
  }

  create(data: Partial<User> & { password: string }): Observable<any> {
    return this.http
      .post<Wrapped<any>>(`${environment.apiUrl}/auth/signup`, data, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  update(id: string, data: Partial<User>): Observable<any> {
    return this.http
      .put<Wrapped<any>>(`${this.API}/${id}`, data, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  remove(id: string): Observable<any> {
    return this.http
      .delete<Wrapped<any>>(`${this.API}/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateRoles(id: string, roleIds: string[]): Observable<any> {
    return this.http
      .put<Wrapped<any>>(`${this.API}/${id}/roles`, { roles: roleIds }, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error al gestionar el usuario.';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Debes iniciar sesión.';
    } else if (error.status === 400) {
      message = 'No puedes eliminar tu propio usuario.';
    }
    return throwError(() => message);
  }
}
