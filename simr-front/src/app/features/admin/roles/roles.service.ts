import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Role } from '@core/models/user.model';

interface Wrapped<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PermissionShape {
  [resource: string]: { [action: string]: ('own' | 'any')[] };
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly API = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(includeInactive = false): Observable<Role[]> {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    return this.http
      .get<Wrapped<Role[]>>(this.API, { params: params as any, withCredentials: true })
      .pipe(
        map((r) => (r.data as Role[]) || []),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<Role & { permissions?: PermissionShape; allPermissions?: any }> {
    return this.http
      .get<Wrapped<Role & { permissions?: PermissionShape; allPermissions?: any }>>(
        `${this.API}/${id}`,
        { withCredentials: true }
      )
      .pipe(
        map((r) => r.data as any),
        catchError(this.handleError)
      );
  }

  getResources(): Observable<string[]> {
    return this.http
      .get<Wrapped<{ key: string; name: string; description: string }[]>>(
        `${this.API}/resources`,
        { withCredentials: true }
      )
      .pipe(
        map((r) => (r.data || []).map((x) => x.key)),
        catchError(this.handleError)
      );
  }

  create(data: any): Observable<any> {
    return this.http
      .post<Wrapped<any>>(this.API, data, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  update(id: string, data: any): Observable<any> {
    return this.http
      .put<Wrapped<any>>(`${this.API}/${id}`, data, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  remove(id: string): Observable<any> {
    return this.http
      .delete<Wrapped<any>>(`${this.API}/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error al gestionar el rol.';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 403) {
      message = 'No se puede modificar o eliminar un rol del sistema.';
    } else if (error.status === 401) {
      message = 'Debes iniciar sesión.';
    }
    return throwError(() => message);
  }
}
