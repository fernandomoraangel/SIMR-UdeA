import {
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ArchivosService } from '../archivos.service';
import { HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SharedMessageData } from '../models/archivo.interface';

@Component({
  selector: 'app-archivo-subida',
  templateUrl: './archivo-subida.component.html',
  styleUrls: ['./archivo-subida.component.css'],
  standalone: false,
})
export class ArchivoSubidaComponent implements OnInit, OnDestroy {
  // @Output() fileUploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading: boolean = false;
  uploadProgress: number = 0;
  processingFile: boolean = false;

  // Comunicacion con AngularJS por PostMessages
  messageFromAngularJS: string = '';
  messageToAngularJS: SharedMessageData = { type: '', status: '', message: '' };
  angularJSOrigin = 'http://localhost:3000'; // Dominio de la app AngularJS
  private messageListener: any;
  private isCalledFromAngularJSOrigin: boolean = false;

  constructor(
    private archivosService: ArchivosService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
    if (window.opener) {
      this.isCalledFromAngularJSOrigin = true;
    }
    console.log(
      'isCalledFromAngularJSOrigin',
      this.isCalledFromAngularJSOrigin
    );
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
  }

  receiveMessage(event: MessageEvent) {
    if (event.origin !== this.angularJSOrigin) {
      return;
    }

    this.ngZone.run(() => {
      this.messageFromAngularJS = event.data;
    });
  }

  sendMessage(myMessage: string): void {
    // Para ventanas emergentes
    if (window.opener) {
      window.opener.postMessage(myMessage, this.angularJSOrigin);
    } else if (window.parent) {
      // Para iframes
      window.parent.postMessage(myMessage, this.angularJSOrigin);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const sanitizedName = this.sanitizeFileName(file.name);
      if (sanitizedName !== file.name) {
        Swal.fire({
          title: 'Nombre de archivo modificado',
          text: `El nombre del archivo contenía caracteres no válidos y fue modificado a: ${sanitizedName}`,
          icon: 'info',
          confirmButtonText: 'Aceptar',
        });
      }
      // Crear un nuevo File con el nombre sanitizado
      this.selectedFile = new File([file], sanitizedName, { type: file.type });
    }
    this.uploadProgress = 0;
    this.processingFile = false;
  }

  private sanitizeFileName(name: string): string {
    // Remover caracteres problemáticos que pueden causar "illegal path"
    // Caracteres inválidos en nombres de archivo: < > : " | ? * \
    const invalidChars = /[<>:"|?*\\]/g;
    // Reemplazar con guiones bajos
    let sanitized = name.replace(invalidChars, '_');
    // También remover caracteres de control y otros problemáticos
    sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '_');
    // Limitar longitud si es necesario (Windows tiene límites)
    if (sanitized.length > 255) {
      const extIndex = sanitized.lastIndexOf('.');
      if (extIndex > 0) {
        const ext = sanitized.substring(extIndex);
        const base = sanitized.substring(0, extIndex);
        sanitized = base.substring(0, 255 - ext.length) + ext;
      } else {
        sanitized = sanitized.substring(0, 255);
      }
    }
    return sanitized;
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.uploading = true;
      this.archivosService.uploadFile(this.selectedFile).subscribe({
        next: (event: any) => {
          if (event.type === 'progress') {
            this.uploadProgress = event.progress;
            if (this.uploadProgress === 100) {
              console.log('Procesando archivo...');
              this.processingFile = true;
            }
          } else if (event.type === 'response') {
            console.log('Archivo subido exitosamente:', event.body);
            if (event.body && event.body.fileData) {
              console.log('Información del archivo a enviar:', event.body);
              this.sendFileInfoToAngularJS(event.body);
            } else {
              console.error(
                'La respuesta del servidor no contiene la información del archivo esperada'
              );
            }
            this.selectedFile = null;
            this.uploading = false;
            this.processingFile = false;
            this.uploadProgress = 0;
          }
        },
        error: (error) => {
          console.error('Error al subir el archivo:', error);
          this.uploading = false;
          this.processingFile = false;
          this.uploadProgress = 0;
          Swal.fire({
            title: '¡Error!',
            text: 'Error interno del servidor... Intente de nuevo más tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    }
  }

  sendFileInfoToAngularJS(fileInfo: any): void {
    console.log('Información del archivo a enviar:', fileInfo);
    const selectedFileInfo = {
      filename: fileInfo.fileData.filename,
      originalName: fileInfo.fileData.originalName,
      mimetype: fileInfo.fileData.mimetype,
      size: fileInfo.fileData.size,
      uploadDate: fileInfo.fileData.uploadDate,
      minioObjectName: fileInfo.fileData.minioObjectName,
      documentId: fileInfo.documentId,
    };

    this.messageToAngularJS = {
      type: 'FILE_UPLOAD',
      message: JSON.stringify(selectedFileInfo),
    };

    if (window.opener) {
      console.log('Ventana padre encontrada');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Archivo subido exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        window.opener.postMessage(
          this.messageToAngularJS,
          this.angularJSOrigin
        );
        console.log('Mensaje enviado a AngularJS');
        window.close();
      });
    } else {
      console.error(
        'No hay ventana padre para enviar el mensaje.\nDeshaciendo operación...'
      );
      this.archivosService
        .deleteFile(selectedFileInfo.minioObjectName)
        .subscribe({
          next: (response) => {
            console.log('Operación deshecha con éxito:', response.message);
          },
          error: (error) => {
            console.error('Error al deshacer la operación:', error);
          },
          complete: () => {
            console.log('Operación terminada');
          },
        });
      Swal.fire({
        title: '¡Error!',
        text: 'Se perdió la conexión con el formulario',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      window.close();
    }
  }
}
