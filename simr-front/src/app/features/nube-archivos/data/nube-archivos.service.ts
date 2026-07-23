import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { NubeArchivoListResponse, TagCount } from '../models/nube-archivo.interface';

@Injectable({ providedIn: 'root' })
export class NubeArchivosService {
  private readonly api = `${environment.apiUrl}/nube-archivos`;

  constructor(private http: HttpClient) {}

  list(params?: { tags?: string; search?: string; page?: number; limit?: number }): Observable<NubeArchivoListResponse> {
    let httpParams = new HttpParams();
    if (params?.tags) httpParams = httpParams.set('tags', params.tags);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<NubeArchivoListResponse>(this.api, { params: httpParams, withCredentials: true });
  }

  upload(file: File, tags: string): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('tags', tags);
    return this.http.post(this.api, fd, { withCredentials: true });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}`, { withCredentials: true });
  }

  downloadUrl(id: string): string {
    return `${this.api}/${id}/download`;
  }

  updateTags(id: string, tags: string[]): Observable<any> {
    return this.http.put(`${this.api}/${id}/tags`, { tags }, { withCredentials: true });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { withCredentials: true });
  }

  getAllTags(): Observable<{ success: boolean; data: TagCount[] }> {
    return this.http.get<{ success: boolean; data: TagCount[] }>(`${this.api}/tags`, { withCredentials: true });
  }
}
