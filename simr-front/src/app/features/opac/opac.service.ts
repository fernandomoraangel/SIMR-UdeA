import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { OpacObra, OpacActor, OpacFondoColeccion, OpacResponse } from './opac.models';

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
}
