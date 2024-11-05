import { Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { ArchivoService } from '../archivo.service';
import { HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SharedMessageData } from '../../../models/shared-message-data.interface';

@Component({
  selector: 'app-archivo-subida',
  templateUrl: './archivo-subida.component.html',
  styleUrls: ['./archivo-subida.component.css']
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
    private archivoService: ArchivoService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
    if (window.opener) {
      this.isCalledFromAngularJSOrigin = true;
    }
    console.log('isCalledFromAngularJSOrigin', this.isCalledFromAngularJSOrigin);
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
    this.selectedFile = event.target.files[0];
    this.uploadProgress = 0;
    this.processingFile = false;
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.uploading = true;
      this.archivoService.uploadFile(this.selectedFile).subscribe({
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
              console.error('La respuesta del servidor no contiene la información del archivo esperada');
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
            confirmButtonText: 'Aceptar'
          });
        }
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
      documentId: fileInfo.documentId
    };

    this.messageToAngularJS = { type: 'FILE_UPLOAD', message: JSON.stringify(selectedFileInfo) }

    if (window.opener) {
      console.log('Ventana padre encontrada');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Archivo subido exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        window.opener.postMessage(this.messageToAngularJS, this.angularJSOrigin);
        console.log('Mensaje enviado a AngularJS');
        window.close();
      });
    } else {
      console.error('No hay ventana padre para enviar el mensaje.\nDeshaciendo operación...');
      this.archivoService.deleteFile(selectedFileInfo.minioObjectName).subscribe({
        next: (response) => {
          console.log('Operación deshecha con éxito:', response.message);
        },
        error: (error) => {
          console.error('Error al deshacer la operación:', error);
        },
        complete: () => {
          console.log('Operación terminada');
        }
      });
      Swal.fire({
        title: '¡Error!',
        text: 'Se perdió la conexión con el formulario',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      window.close();
    }
  }

}