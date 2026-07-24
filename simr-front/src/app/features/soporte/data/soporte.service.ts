import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';

import { SupportTicket, TicketListResponse } from '../domain/soporte.interface';

@Injectable({ providedIn: 'root' })
export class SoporteService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/soporte`;

  list(params?: { status?: string; priority?: string; search?: string; page?: number; limit?: number }): Observable<TicketListResponse> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.priority) httpParams = httpParams.set('priority', params.priority);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<TicketListResponse>(this.API, { params: httpParams });
  }

  getById(id: string): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.API}/${id}`);
  }

  create(data: { subject: string; description: string; priority?: string }): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(this.API, data);
  }

  update(id: string, data: Partial<SupportTicket>): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.API}/${id}`, data);
  }

  delete(id: string): Observable<SupportTicket> {
    return this.http.delete<SupportTicket>(`${this.API}/${id}`);
  }

  addResponse(id: string, message: string): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.API}/${id}/respuestas`, { message });
  }
}
