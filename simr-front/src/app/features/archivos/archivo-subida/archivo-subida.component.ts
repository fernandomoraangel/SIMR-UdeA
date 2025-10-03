import {
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ArchivosService } from '../archivos.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  angularJSOrigin = window.location.origin; // Usar el mismo origen (localhost:80)
  private messageListener: any;
  private isCalledFromAngularJSOrigin: boolean = false;

  constructor(
    private archivosService: ArchivosService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
    console.log('=== DEBUGGING WINDOW REFERENCES ===');
    console.log('window.opener:', window.opener);
    console.log('window.parent:', window.parent);
    console.log('window.parent !== window:', window.parent !== window);
    console.log('window.top:', window.top);
    console.log('window.top !== window:', window.top !== window);
    console.log('document.referrer:', document.referrer);
    console.log('window.location:', window.location.href);
    console.log('window.name:', window.name);
    console.log('=====================================');

    // Mejorar la detección del contexto de llamada
    if (window.opener) {
      this.isCalledFromAngularJSOrigin = true;
      console.log('Componente abierto como popup (window.opener exists)');
    } else if (window.parent && window.parent !== window) {
      this.isCalledFromAngularJSOrigin = true;
      console.log('Componente abierto como iframe (window.parent exists)');
    } else if (window.top && window.top !== window) {
      this.isCalledFromAngularJSOrigin = true;
      console.log('Componente en contexto de frame (window.top exists)');
    } else if (window.name === 'AngularApp') {
      // Verificación adicional: si la ventana tiene el nombre correcto, probablemente es un popup
      this.isCalledFromAngularJSOrigin = true;
      console.log('Componente detectado por nombre de ventana (AngularApp)');
    } else if (
      document.referrer &&
      document.referrer.indexOf('localhost') !== -1
    ) {
      // Verificación adicional: si hay referrer del mismo origen
      this.isCalledFromAngularJSOrigin = true;
      console.log('Componente detectado por referrer del mismo origen');
    }

    console.log(
      'isCalledFromAngularJSOrigin',
      this.isCalledFromAngularJSOrigin
    );

    // Verificar autenticación al cargar el componente
    this.authService.authState$.subscribe({
      next: (authState: any) => {
        console.log('🔐 Estado de autenticación en popup:', authState);
        if (!authState.isAuthenticated) {
          console.warn('⚠️ Usuario no autenticado en popup, intentando verificar...');
          // Intentar verificar manualmente
          this.authService.verifyAuth().subscribe({
            next: (verifyResult: any) => {
              console.log('✅ Verificación manual exitosa:', verifyResult);
            },
            error: (error: any) => {
              console.error('❌ Error en verificación manual:', error);
            }
          });
        } else {
          console.log('✅ Usuario autenticado en popup');
        }
      },
      error: (error: any) => {
        console.error('❌ Error verificando autenticación:', error);
      }
    });
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
    console.log('Attempting to send message:', myMessage);
    let messageSent = false;

    // Para ventanas emergentes
    if (window.opener && typeof window.opener.postMessage === 'function') {
      try {
        window.opener.postMessage(myMessage, this.angularJSOrigin);
        console.log('Message sent via window.opener');
        messageSent = true;
      } catch (error) {
        console.error('Error sending message via window.opener:', error);
      }
    }

    // Para iframes
    if (
      !messageSent &&
      window.parent &&
      window.parent !== window &&
      typeof window.parent.postMessage === 'function'
    ) {
      try {
        window.parent.postMessage(myMessage, this.angularJSOrigin);
        console.log('Message sent via window.parent');
        messageSent = true;
      } catch (error) {
        console.error('Error sending message via window.parent:', error);
      }
    }

    // Para contextos de frame anidados
    if (
      !messageSent &&
      window.top &&
      window.top !== window &&
      typeof window.top.postMessage === 'function'
    ) {
      try {
        window.top!.postMessage(myMessage, this.angularJSOrigin);
        console.log('Message sent via window.top');
        messageSent = true;
      } catch (error) {
        console.error('Error sending message via window.top:', error);
      }
    }

    if (!messageSent) {
      console.warn('No valid parent window found for message sending');
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
    console.log('=== ANGULAR DEBUG: INICIANDO ENVÍO ===');
    console.log('🔍 Información del archivo a enviar:', fileInfo);

    const selectedFileInfo = {
      filename: fileInfo.fileData.filename,
      originalName: fileInfo.fileData.originalName,
      mimetype: fileInfo.fileData.mimetype,
      size: fileInfo.fileData.size,
      uploadDate: fileInfo.fileData.uploadDate,
      minioObjectName: fileInfo.fileData.minioObjectName,
      documentId: fileInfo.documentId,
    };

    console.log('📦 Objeto preparado para envío:', selectedFileInfo);

    this.messageToAngularJS = {
      type: 'FILE_UPLOAD',
      message: JSON.stringify(selectedFileInfo),
    };

    console.log('📨 Mensaje completo a enviar:', this.messageToAngularJS);
    console.log('🎯 Destino:', this.angularJSOrigin);

    console.log('=== CHECKING PARENT WINDOWS FOR MESSAGE SENDING ===');
    let parentFound = false;
    let messageMethod = '';

    // Estrategia 1: window.opener (más común para popups)
    if (window.opener && typeof window.opener.postMessage === 'function') {
      try {
        window.opener.postMessage(
          this.messageToAngularJS,
          this.angularJSOrigin
        );
        console.log('✅ Mensaje enviado via window.opener');
        parentFound = true;
        messageMethod = 'opener';
      } catch (error) {
        console.error('❌ Error sending message via opener:', error);
      }
    }

    // Estrategia 2: window.parent (para iframes)
    if (
      !parentFound &&
      window.parent &&
      window.parent !== window &&
      typeof window.parent.postMessage === 'function'
    ) {
      try {
        window.parent.postMessage(
          this.messageToAngularJS,
          this.angularJSOrigin
        );
        console.log('✅ Mensaje enviado via window.parent');
        parentFound = true;
        messageMethod = 'parent';
      } catch (error) {
        console.error('❌ Error sending message via parent:', error);
      }
    }

    // Estrategia 3: window.top (para frames anidados)
    if (
      !parentFound &&
      window.top &&
      window.top !== window &&
      typeof window.top.postMessage === 'function'
    ) {
      try {
        window.top!.postMessage(this.messageToAngularJS, this.angularJSOrigin);
        console.log('✅ Mensaje enviado via window.top');
        parentFound = true;
        messageMethod = 'top';
      } catch (error) {
        console.error('❌ Error sending message via top:', error);
      }
    }

    // Estrategia 4: Comunicación via localStorage y múltiples intentos (respaldo)
    if (!parentFound) {
      try {
        console.log(
          '🔄 Intentando comunicación via localStorage y origen comodín...'
        );

        // Guardar el mensaje en localStorage para que la ventana padre lo pueda leer
        const storageKey = 'angular_file_upload_result';
        const timestamp = Date.now();
        const storageData = {
          ...this.messageToAngularJS,
          timestamp: timestamp,
          windowName: window.name || 'unknown',
        };

        localStorage.setItem(storageKey, JSON.stringify(storageData));
        console.log('✅ Datos guardados en localStorage:', storageData);

        // Intentar con window.opener usando origen comodín
        if (window.opener) {
          try {
            window.opener.postMessage(this.messageToAngularJS, '*');
            console.log('✅ Mensaje enviado via opener con origen comodín');
            parentFound = true;
            messageMethod = 'opener-wildcard';
          } catch (error) {
            console.error('❌ Error con origen comodín:', error);
          }
        }

        // Si aún no funciona, intentar con window.parent usando origen comodín
        if (!parentFound && window.parent && window.parent !== window) {
          try {
            window.parent.postMessage(this.messageToAngularJS, '*');
            console.log('✅ Mensaje enviado via parent con origen comodín');
            parentFound = true;
            messageMethod = 'parent-wildcard';
          } catch (error) {
            console.error('❌ Error con parent origen comodín:', error);
          }
        }

        // Como último recurso, considerar exitoso si guardamos en localStorage
        if (!parentFound) {
          console.log('📝 Usando localStorage como método de comunicación');
          parentFound = true;
          messageMethod = 'localStorage';
        }
      } catch (error) {
        console.error('❌ Error en estrategia localStorage:', error);
      }
    }

    if (parentFound) {
      Swal.fire({
        title: '¡Éxito!',
        text: 'Archivo subido exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        console.log(`Cerrando ventana... (método usado: ${messageMethod})`);
        setTimeout(() => window.close(), 2000); // Reducir delay para mejor UX
      });
    } else {
      console.error(
        '❌ No se encontró ventana padre para enviar el mensaje.\n🔄 Deshaciendo operación...'
      );

      // Crear objeto de archivo completo para la eliminación
      const fileToDelete = {
        fileName: selectedFileInfo.minioObjectName,
        id: selectedFileInfo.documentId,
        documentId: selectedFileInfo.documentId,
      };

      this.archivosService.deleteFile(fileToDelete).subscribe({
        next: (response) => {
          console.log('✅ Operación deshecha con éxito:', response.message);
        },
        error: (error) => {
          console.error('❌ Error al deshacer la operación:', error);
        },
        complete: () => {
          console.log('✅ Operación terminada');
        },
      });

      Swal.fire({
        title: '¡Error!',
        text: 'Se perdió la conexión con el formulario. El archivo se eliminó automáticamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        footer:
          'Intente abrir el formulario nuevamente desde el sistema principal.',
      }).then(() => {
        setTimeout(() => window.close(), 3000);
      });
    }
  }
}
