import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface AuditLog {
  _id: string;
  action: string;
  performedBy?: { _id: string; firstName?: string; lastName?: string; email?: string };
  targetUser?: { _id: string; firstName?: string; lastName?: string; email?: string };
  targetRole?: { _id: string; name?: string; description?: string };
  targetType?: string;
  targetName?: string;
  targetId?: string;
  details?: any;
  createdAt?: string;
}

export interface AuditQuery {
  action?: string;
  userId?: string;
  roleId?: string;
  targetType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortDir?: string;
  limit?: number;
  skip?: number;
}

interface AuditResponse {
  logs: AuditLog[];
  pagination: { total: number; limit: number; skip: number; hasMore: boolean };
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly API = `${environment.apiUrl}/auditlogs`;

  constructor(private http: HttpClient) {}

  list(query: AuditQuery = {}): Observable<{ logs: AuditLog[]; pagination: AuditResponse['pagination'] }> {
    let params = new HttpParams();
    if (query.action) params = params.set('action', query.action);
    if (query.userId) params = params.set('userId', query.userId);
    if (query.roleId) params = params.set('roleId', query.roleId);
    if (query.targetType) params = params.set('targetType', query.targetType);
    if (query.search) params = params.set('search', query.search);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.sortField) params = params.set('sortField', query.sortField);
    if (query.sortDir) params = params.set('sortDir', query.sortDir);
    params = params.set('limit', String(query.limit ?? 50));
    params = params.set('skip', String(query.skip ?? 0));

    return this.http
      .get<{ success: boolean; data: AuditResponse }>(this.API, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error al consultar la auditoría.';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Debes iniciar sesión.';
    } else if (error.status === 403) {
      message = 'No tienes permisos para ver la auditoría.';
    }
    return throwError(() => message);
  }
}
