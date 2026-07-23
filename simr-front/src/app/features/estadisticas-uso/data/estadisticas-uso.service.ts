import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionUso, EstadisticasUsoResponse } from '../models/sesion-uso.model';
import { environment } from '@env/environment';

export class EstadisticasUsoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usos`;

  crearSesion(input: Partial<SesionUso>): Promise<SesionUso> {
    return this.http.post<SesionUso>(this.baseUrl, input).toPromise() as Promise<SesionUso>;
  }

  cerrarSesion(id: string): Promise<SesionUso> {
    return this.http.put<SesionUso>(`${this.baseUrl}/${id}/cerrar`, {}).toPromise() as Promise<SesionUso>;
  }

  obtenerEstadisticas(): Promise<EstadisticasUsoResponse> {
    return this.http.get<EstadisticasUsoResponse>(`${this.baseUrl}/estadisticas`).toPromise() as Promise<EstadisticasUsoResponse>;
  }

  obtenerSesiones(params?: { pagina?: number; limite?: number; activo?: boolean; modulo?: string }): Promise<{ data: SesionUso[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.pagina) queryParams.set('pagina', params.pagina.toString());
    if (params?.limite) queryParams.set('limite', params.limite.toString());
    if (params?.activo !== undefined) queryParams.set('activo', params.activo.toString());
    if (params?.modulo) queryParams.set('modulo', params.modulo);
    
    return this.http.get<{ data: SesionUso[]; total: number }>(`${this.baseUrl}?${queryParams.toString()}`).toPromise() as Promise<{ data: SesionUso[]; total: number }>;
  }

  obtenerSesion(id: string): Promise<SesionUso> {
    return this.http.get<SesionUso>(`${this.baseUrl}/${id}`).toPromise() as Promise<SesionUso>;
  }

  eliminarSesion(id: string): Promise<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).toPromise();
  }
}