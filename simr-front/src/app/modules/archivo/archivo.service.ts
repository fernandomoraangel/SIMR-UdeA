import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { FileBasicInfo } from './archivo.module';

// @Injectable()
@Injectable({
  providedIn: 'root'
})
export class ArchivoService {
  // private apiUrl = 'http://localhost:3000';
  private apiUrl = 'http://localhost:3000/files';
  // private fileUploadedSource = new Subject<void>();
  private fileChangedSource = new Subject<void>();

  // fileUploaded$ = this.fileUploadedSource.asObservable();
  fileChanged$ = this.fileChangedSource.asObservable();

  constructor(private http: HttpClient) { }


  // getFilesByActor(actorId: string): Observable<any[]> {
  //   return this.http.get<any>(`${this.apiUrl}/api/actores/${actorId}`).pipe(
  //     map(actor => actor.archivosAdjuntos || [])
  //   );
  // }

  // getDocumentFiles(collectionName: string, documentId: string, propertyName: string): Observable<any[]> {
  getDocumentFiles(collection: string, documentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/document-files`, {
      params: {
        collection: collection,
        documentId: documentId
      }
    });
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req).pipe(
      tap(() => this.fileChangedSource.next()),
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / (event.total || 1));
            return { type: 'progress', progress: progress };
          case HttpEventType.Response:
            return { type: 'response', body: event.body };
          default:
            return `Unhandled event: ${event.type}`;
        }
      })
    );
  }

  // uploadFile(file: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('file', file, file.name);

  //   const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
  //     reportProgress: true,
  //     responseType: 'json'
  //   });

  //   return this.http.request(req).pipe(
  //     tap(() => this.fileChangedSource.next())
  //   );

  //   // return this.http.post<{ message: string }>(`${this.apiUrl}/upload`, formData)
  //   //   .pipe(
  //   //     // tap(() => this.fileUploadedSource.next())
  //   //     tap(() => this.fileChangedSource.next())
  //   //   );
  // }


  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files`);
  }


  // downloadFile(filename: string): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/download/${filename}`, { responseType: 'blob' });
  // }

  // downloadFile(filename: string): void {
  //   const url = `${this.apiUrl}/download/${filename}`;
  //   window.open(url, '_blank');
  // }

  downloadFile(filename: string): void {
    const url = `${this.apiUrl}/download/${filename}`;

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

  // deleteFile(filename: string, actorId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/files/${actorId}/${filename}`);
  // }

  // deleteFile(filename: string): Observable<any> {
  // (MinIO file name, File id of Archivo collection, Document id of collection where file is attached)
  deleteFile(fileName: string, fileId?: string, documentId?: string): Observable<any> {
    const url = `${this.apiUrl}/${fileName}`;

    // const additionalFileInfo = fileId && documentId ? { fileInfo: { id: fileId, documentId: documentId } } : {};
    const additionalFileInfo = { fileInfo: { id: fileId, documentId: documentId } };

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: additionalFileInfo
    };

    return this.http.delete<{ message: string }>(url, options)
      .pipe(
        tap(() => this.fileChangedSource.next())
      );

    // const fileInfo = {
    //   name: fileName,
    //   id: fileId,
    //   documentId: documentId
    // };

    // const jsonFileInfo = JSON.stringify(fileInfo);
    // console.log('(deleteFile - ArchivoService)JSON File Info:', jsonFileInfo);

    // return this.http.delete<{ message: string }>(`${this.apiUrl}/delete/${filename}`)
    // return this.http.request<{ message: string }>('DELETE', this.apiUrl, {
    //   body: jsonFileInfo,
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    //   responseType: 'json',
    //   reportProgress: true
    // })
    //   .pipe(
    //     tap(() => this.fileChangedSource.next())
    //   );
  }

  deleteMultipleFiles(filenames: string[]): Observable<any> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/delete-multiple`, { filenames })
      .pipe(
        tap(() => this.fileChangedSource.next())
      );
  }


  // Previsualization of files
  getFileUrl(filename: string): string {
    return `${this.apiUrl}/view/${filename}`;
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