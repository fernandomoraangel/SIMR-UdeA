import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { OpacObra, OpacActor, OpacFondoColeccion, OpacRoleResponse, OpacInstrumentoResult, OpacGeneroResult, OpacResponse } from './opac.models';

@Injectable({ providedIn: 'root' })
export class OpacService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/opac`;

  searchObras(q: string): Observable<OpacResponse<OpacObra>> {
    return this.http.get<OpacResponse<OpacObra>>(`${this.API}/obras`, { params: { q } });
  }

  searchActores(q: string): Observable<OpacResponse<OpacActor>> {
    return this.http.get<OpacResponse<OpacActor>>(`${this.API}/actores`, { params: { q } });
  }

  searchFondosColecciones(q: string): Observable<OpacResponse<OpacFondoColeccion>> {
    return this.http.get<OpacResponse<OpacFondoColeccion>>(`${this.API}/fondos`, { params: { q } });
  }

  searchByRole(q: string): Observable<OpacRoleResponse> {
    return this.http.get<OpacRoleResponse>(`${this.API}/roles`, { params: { q } });
  }

  searchByInstrumento(q: string): Observable<OpacResponse<OpacInstrumentoResult>> {
    return this.http.get<OpacResponse<OpacInstrumentoResult>>(`${this.API}/instrumentos`, { params: { q } });
  }

  searchByGenero(q: string): Observable<OpacResponse<OpacGeneroResult>> {
    return this.http.get<OpacResponse<OpacGeneroResult>>(`${this.API}/generos`, { params: { q } });
  }
}
