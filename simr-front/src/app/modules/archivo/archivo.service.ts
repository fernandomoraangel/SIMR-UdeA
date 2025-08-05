import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import {
  FileBasicInfo,
  FileDeleteInfo,
  FileDocumentInfo,
} from './archivo.module';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private readonly API_URL = `${environment.originUrl}/files`;
  private fileChangedSource = new Subject<void>();

  fileChanged$ = this.fileChangedSource.asObservable();

  constructor(private http: HttpClient) {}

  getDocumentFiles(collection: string, documentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/document-files`, {
      params: {
        collection: collection,
        documentId: documentId,
      },
    });
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.API_URL}/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req).pipe(
      tap(() => this.fileChangedSource.next()),
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(
              (100 * event.loaded) / (event.total || 1)
            );
            return { type: 'progress', progress: progress };
          case HttpEventType.Response:
            return { type: 'response', body: event.body };
          default:
            return `Unhandled event: ${event.type}`;
        }
      })
    );
  }

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/files`);
  }

  downloadFile(filename: string): void {
    const url = `${this.API_URL}/download/${filename}`;

    // Crear un elemento <a> temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Sugerir un nombre de archivo para la descarga
    link.style.display = 'none';

    // Añadir el enlace al DOM
    document.body.appendChild(link);

    // Simular un clic en el enlace
    link.click();

    // Limpiar: remover el enlace del DOM
    document.body.removeChild(link);
  }

  deleteFile(file: FileDeleteInfo): Observable<any> {
    const url = `${this.API_URL}/${file.fileName}`;

    // const additionalFileInfo = fileId && documentId ? { fileInfo: { id: fileId, documentId: documentId } } : {};
    const additionalFileInfo = {
      fileInfo: { id: file.id, documentId: file.documentId },
    };

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: additionalFileInfo,
    };

    return this.http
      .delete<{ message: string }>(url, options)
      .pipe(tap(() => this.fileChangedSource.next()));
  }

  deleteMultipleFiles(files: FileDeleteInfo[]): Observable<any> {
    return this.http
      .post<{
        message: string;
        results: Array<{
          fileName: string;
          success: boolean;
          message: string;
        }>;
      }>(`${this.API_URL}/delete-multiple`, { files })
      .pipe(
        tap(() => this.fileChangedSource.next()),
        map((response) => {
          // Verificar si hay algún error en los resultados
          const hasErrors = response.results.some((result) => !result.success);
          if (hasErrors) {
            const errorMessages = response.results
              .filter((result) => !result.success)
              .map((result) => `${result.fileName}: ${result.message}`)
              .join('\n');
            throw new Error(errorMessages);
          }
          return response;
        })
      );
  }

  // Previsualization of files
  getFileUrl(filename: string): string {
    return `${this.API_URL}/view/${filename}`;
  }

  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    console.log('Extension:', extension);
    if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (extension && ['txt', 'csv', 'json'].includes(extension)) {
      return 'text';
    } else if (extension && ['mp4', 'webm'].includes(extension)) {
      return 'video';
    } else if (extension && ['mp3', 'wav', 'ogg'].includes(extension)) {
      return 'audio';
    }
    return 'other';
  }
  // End of previsualization of files
}
