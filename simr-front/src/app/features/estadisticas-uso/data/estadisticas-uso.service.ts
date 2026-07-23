import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SesionUso, ApiResponse, EstadisticasUsoData } from '../models/sesion-uso.model';
import { environment } from '@env/environment';

export class EstadisticasUsoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usos`;

  crearSesion(input: Partial<SesionUso>): Promise<SesionUso> {
    return firstValueFrom(this.http.post<ApiResponse<SesionUso>>(this.baseUrl, input))
      .then(r => r.data);
  }

  cerrarSesion(id: string): Promise<SesionUso> {
    return firstValueFrom(this.http.put<ApiResponse<SesionUso>>(`${this.baseUrl}/${id}/cerrar`, {}))
      .then(r => r.data);
  }

  obtenerEstadisticas(): Promise<EstadisticasUsoData> {
    return firstValueFrom(this.http.get<ApiResponse<EstadisticasUsoData>>(`${this.baseUrl}/estadisticas`))
      .then(r => r.data);
  }

  obtenerSesiones(params?: { pagina?: number; limite?: number; activo?: boolean; modulo?: string }): Promise<{ data: SesionUso[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.pagina) queryParams.set('pagina', params.pagina.toString());
    if (params?.limite) queryParams.set('limite', params.limite.toString());
    if (params?.activo !== undefined) queryParams.set('activo', params.activo.toString());
    if (params?.modulo) queryParams.set('modulo', params.modulo);
    return firstValueFrom(this.http.get<ApiResponse<SesionUso[]> & { total: number }>(`${this.baseUrl}?${queryParams.toString()}`))
      .then(r => ({ data: r.data, total: r.total }));
  }

  obtenerSesion(id: string): Promise<SesionUso> {
    return firstValueFrom(this.http.get<ApiResponse<SesionUso>>(`${this.baseUrl}/${id}`))
      .then(r => r.data);
  }

  eliminarSesion(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  registrarAccion(sesionId: string, entidad: string, tipoAccion: string, entidadId?: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.baseUrl}/accion`, { sesionId, entidad, tipoAccion, entidadId }));
  }
}