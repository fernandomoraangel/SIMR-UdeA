import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface NubeConfig {
  maxFileSize: number;
  maxFileSizeMB: number;
}

@Injectable({ providedIn: 'root' })
export class NubeConfigService {
  private readonly API = `${environment.apiUrl}/nube-archivos/config`;

  constructor(private http: HttpClient) {}

  get(): Observable<NubeConfig> {
    return this.http
      .get<{ success: boolean; data: NubeConfig; message: string }>(this.API, {
        withCredentials: true,
      })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError)
      );
  }

  update(maxFileSizeMB: number): Observable<NubeConfig> {
    return this.http
      .put<{ success: boolean; data: NubeConfig; message: string }>(
        this.API,
        { maxFileSizeMB },
        { withCredentials: true }
      )
      .pipe(
        map((r) => r.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg =
      error.error?.message || `Error ${error.status}: ${error.statusText}`;
    return throwError(() => msg);
  }
}
