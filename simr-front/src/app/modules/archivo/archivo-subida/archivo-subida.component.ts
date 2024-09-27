import { Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { ArchivoService } from '../services/archivo.service';
import { HttpEventType } from '@angular/common/http';

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
  angularJSOrigin = 'http://localhost:3000'; // Dominio de la app AngularJS
  private messageListener: any;

  constructor(
    private archivoService: ArchivoService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
  }

  receiveMessage(event: MessageEvent) {
    if (event.origin !== this.angularJSOrigin) return;

    this.ngZone.run(() => {
      this.messageFromAngularJS = event.data;
    });
  }

  sendMessage(myMessage: string): void {
    // alert('Enviando mensaje a AngularJS...');
    // Para ventanas emergentes
    if (window.opener) {
      // alert('Enviando mensaje a AngularJS desde ventana...');
      // window.opener.postMessage('Hola desde Angular', this.angularJSOrigin);
      window.opener.postMessage(myMessage, this.angularJSOrigin);
    } else if (window.parent) {
      // Para iframes
      // alert('Enviando mensaje a AngularJS desde iFrame...');
      // window.parent.postMessage('Hola desde Angular', this.angularJSOrigin);
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
            if (event.body && event.body.fileInfo) {
              this.sendFileInfoToAngularJS(event.body.fileInfo);
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
        }
      });
    }
  }

  // uploadFile(): void {
  //   if (this.selectedFile) {
  //     this.uploading = true;
  //     this.archivoService.uploadFile(this.selectedFile).subscribe({
  //       next: (event) => {
  //         if (event.type === HttpEventType.UploadProgress) {
  //           this.uploadProgress = Math.round(100 * event.loaded / event.total);
  //           if (this.uploadProgress === 100) {
  //             console.log('Procesando archivo...');
  //             this.processingFile = true;
  //           }
  //         } else if (event.type === HttpEventType.Response) {
  //           console.log(event.body.message);
  //           this.sendFileInfoToAngularJS(event.body);
  //           this.selectedFile = null;
  //           this.uploading = false;
  //           this.processingFile = false;
  //           this.uploadProgress = 0;
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error al subir el archivo:', error);
  //         this.uploading = false;
  //         this.processingFile = false;
  //         this.uploadProgress = 0;
  //       }
  //     });
  //   }
  // }

  sendFileInfoToAngularJS(fileInfo: any): void {
    console.log('Información del archivo a enviar:', fileInfo);
    const fileData = {
      filename: fileInfo.filename,
      originalName: fileInfo.originalName,
      mimetype: fileInfo.mimetype,
      size: fileInfo.size,
      uploadDate: fileInfo.uploadDate,
      minioObjectName: fileInfo.minioObjectName
    };
    console.log('Datos del archivo formateados:', fileData);

    if (window.opener) {
      window.opener.postMessage(JSON.stringify(fileData), this.angularJSOrigin);
      console.log('Mensaje enviado a AngularJS');
      alert('¡Archivo subido exitosamente!');
    } else {
      console.error('No hay ventana padre para enviar el mensaje.\nDeshaciendo operación...');
      this.archivoService.deleteFile(fileInfo.minioObjectName).subscribe({
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
      alert('ERROR: Se perdió la conexión con el formulario');
    }
    window.close();
  }

}