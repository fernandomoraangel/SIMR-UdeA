import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArchivoVistaComponent } from '../archivo-vista/archivo-vista.component';
import { ArchivoService } from '../archivo.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SharedMessageData } from '../../../models/shared-message-data.interface';
import { FileBasicInfo, FileDocumentInfo } from '../archivo.module';

// interface file {
//   id: string;
//   name: string;
//   size: number;
//   lastModified: Date;
// }

@Component({
  selector: 'app-archivo-lista',
  templateUrl: './archivo-lista.component.html',
  styleUrls: ['./archivo-lista.component.css']
})
export class ArchivoListaComponent implements OnInit, OnDestroy {
  // files: any[] = [];
  files: FileBasicInfo[] = [];
  loading: boolean = false;
  selectedFiles: Set<string> = new Set();
  allSelected: boolean = false;
  selectedFileForViewing: string | null = null;

  // actorId: string | null = null;
  // actorId: string = "";
  dbCollection: string = "";
  documentId: string = "";

  private fileChangedSubscription: Subscription = new Subscription();

  // Comunicacion con AngularJS por PostMessages
  messageFromAngularJS: string = '';
  messageToAngularJS: SharedMessageData = { type: '', status: '', message: '' };
  angularJSOrigin = 'http://localhost:3000'; // Dominio de la app AngularJS
  private messageListener: any;

  constructor(
    private dialog: MatDialog,
    private archivoService: ArchivoService,
    private ngZone: NgZone
  ) {
    // window.addEventListener('message', (event) => {
    //   if (event.origin !== this.angularJSOrigin) return;

    //   this.ngZone.run(() => {
    //     this.messageFromAngularJS = event.data;
    //   });

    //   console.log('messageFromAngularJS:', this.messageFromAngularJS);
    // if (event.data && event.data.type === 'FILE_LIST') {
    //   console.log('Datos recibidos:', event.data);
    //   this.dbCollection = event.data.dbCollection;
    //   this.documentId = event.data.message;

    //   this.getDocumentFiles('actores', this.messageFromAngularJS);
    // }
    // }, false);
    // console.log('messageFromAngularJS:', this.messageFromAngularJS);
  }

  ngOnInit(): void {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
    this.messageToAngularJS = { type: 'FILE_LIST', status: 'READY', message: 'Hola desde Angular!' };
    // this.sendMessage(this.messageToAngularJS);s
    window.opener.postMessage(this.messageToAngularJS, this.angularJSOrigin);
    // window.opener.postMessage('READY', this.angularJSOrigin);
    // alert('messageFromAngularJS: ' + this.messageFromAngularJS);
    console.log('messageFromAngularJS:', this.messageFromAngularJS);
    // this.setupMessageListener();
    // this.loadFiles();
    // this.fileUploadSubscription = this.archivoService.fileUploaded$.subscribe(() => {
    this.fileChangedSubscription = this.archivoService.fileChanged$.subscribe(() => {
      // this.loadFiles();
      this.getDocumentFiles(this.dbCollection, this.documentId);
    });
  }

  ngOnDestroy(): void {
    if (this.fileChangedSubscription) {
      this.fileChangedSubscription.unsubscribe();
    }
    window.removeEventListener('message', this.messageListener);
  }
  // ngOnDestroy(): void {
  //   if (this.fileUploadSubscription) {
  //     this.fileUploadSubscription.unsubscribe();
  //   }
  // }

  viewFile(fileName: string) {
    this.dialog.open(ArchivoVistaComponent, {
      width: '90%',
      height: '90%',
      data: { filename: fileName }
    });
  }

  // viewFile2(filename: string): void {
  //   this.selectedFileForViewing = filename;
  // }

  prueba() {
    console.log('Prueba');
    alert(this.documentId);
    console.log('files prueba:', this.files);
    this.messageToAngularJS = { type: 'PRUEBA', message: 'Hola desde Angular!!!!!!!!!!!' }
    this.sendMessage(this.messageToAngularJS);
  }


  receiveMessage(event: MessageEvent) {
    // if (event.origin !== this.angularJSOrigin) return;
    if (event.origin !== this.angularJSOrigin) {
      alert('Origen no permitido');
      return;
    }

    this.ngZone.run(() => {
      this.messageFromAngularJS = event.data;
    });

    console.log('event', event);
    console.log('event.data', event.data);

    console.log('messageFromAngularJS:', this.messageFromAngularJS);
    if (event.data && event.data.type === 'FILE_LIST') {
      console.log('Datos recibidos:', event.data);
      this.dbCollection = event.data.dbCollection;
      this.documentId = event.data.message;

      console.log('DB Collection:', this.dbCollection);
      console.log('Document ID:', this.documentId);
      this.getDocumentFiles(this.dbCollection, this.documentId);
      // this.getDocumentFiles('actors', event.data.message);
      // this.getDocumentFiles(this.dbCollection, this.documentId);

      // if (event.data.db_collection === 'actores') {
      //   this.dbCollection = event.data.db_collection;
      //   this.documentId = event.data.message;
      //   // this.loadFiles();
      // } else if (event.data.db_collection === 'obras') {
      //   console.log('DB Collection:', event.data.db_collection);
      // }
      // this.actorId = event.data.actorId;
      // alert('Actor ID: ' + this.actorId);
      // // this.loadFiles();
    }
  }

  // setupMessageListener(): void {
  //   // alert('Setting up message listener...');
  //   this.messageListener = (event: MessageEvent) => {
  //     alert('Verificando mensaje...');
  //     if (event.data && event.data.type === 'ACTOR_ID') {
  //       this.actorId = event.data.actorId;
  //       alert('Actor ID: ' + this.actorId);
  //       // this.loadFiles();
  //     }
  //   };
  //   window.addEventListener('message', this.messageListener);
  // }

  sendMessage(myMessage: string | SharedMessageData): void {
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

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.selectedFiles.clear();
    } else {
      this.files.forEach(file => this.selectedFiles.add(file.name));
    }
    this.allSelected = !this.allSelected;
  }

  isAllSelected(): boolean {
    return this.selectedFiles.size === this.files.length;
  }

  updateAllSelected(): void {
    this.allSelected = this.isAllSelected();
  }

  toggleFileSelection(filename: string): void {
    if (this.selectedFiles.has(filename)) {
      this.selectedFiles.delete(filename);
    } else {
      this.selectedFiles.add(filename);
    }
    this.updateAllSelected();
  }


  // loadFiles(): void {
  //   this.loading = true;
  //   this.archivoService.getFiles().subscribe({
  //     next: (data) => {
  //       console.log('Todos los Datos:', data);
  //       this.files = data;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar archivos:', error);
  //       this.loading = false;
  //     }
  //   });
  // }


  downloadFile(filename: string): void {
    this.archivoService.downloadFile(filename);
  }

  // downloadFile(filename: string): void {
  //   this.archivoService.downloadFile(filename).subscribe({
  //     next: (blob: Blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = filename;
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (error) => {
  //       console.error('Error al descargar el archivo:', error);
  //     },
  //     complete: () => {
  //       console.log('Descarga completada');
  //     }
  //   });
  // }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // deleteFile(filename: string): void {
  deleteFile(fileInfo: FileBasicInfo): void {
    Swal.fire({
      title: "¡Advertencia de eliminación!",
      text: `¿Estás seguro de que quiere eliminar el archivo "${fileInfo.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // const fileToBeDeleted = {name: fileInfo.name, id: fileInfo.id};
        // this.archivoService.deleteFile(filename, this.actorId).subscribe({
        // this.archivoService.deleteFile(filename).subscribe({
        console.log('archivo a eliminar:', fileInfo);
        this.archivoService.deleteFile(fileInfo.name, fileInfo.id, this.documentId).subscribe({
          next: (response) => {
            console.log('Archivo eliminado con éxito:', response.message);
            const fileDeleted: FileDocumentInfo = {
              id: fileInfo.id,
              name: fileInfo.name,
              documentId: this.documentId
            };
            this.sendMessage({ type: 'FILE_DELETED', status: 'SUCCESS', message: JSON.stringify(fileDeleted) });
            // this.loadFiles();
          },
          error: (error) => {
            console.error('Error al eliminar el archivo:', error);
            Swal.fire({
              title: '¡Error al eliminar el archivo!',
              text: error,
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          },
          complete: () => {
            console.log('Eliminación completada');
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Archivo eliminado exitosamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }


  deleteSelectedFiles(): void {
    if (this.selectedFiles.size === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Por favor, seleccione al menos un archivo para eliminar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const filesToDelete = Array.from(this.selectedFiles);

    Swal.fire({
      title: "¡Advertencia de eliminación!",
      text: `¿Estás seguro de que quiere eliminar ${filesToDelete.length} archivo(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivoService.deleteMultipleFiles(filesToDelete).subscribe({
          next: (response) => {
            console.log('Archivos eliminados con éxito:', response.message);
            this.selectedFiles.clear();
            // this.loadFiles();
          },
          error: (error) => {
            console.error('Error al eliminar los archivos:', error);
            Swal.fire({
              title: '¡Error al eliminar los archivos',
              text: error,
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          },
          complete: () => {
            console.log('Eliminación completada');
            Swal.fire({
              title: '¡Éxito!',
              text: 'Eliminación exitosa',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });

    // if (confirm(`¿Estás seguro de que quiere eliminar ${filesToDelete.length} archivo(s)?`)) {
    //   this.archivoService.deleteMultipleFiles(filesToDelete).subscribe({
    //     next: (response) => {
    //       console.log('Archivos eliminados con éxito:', response.message);
    //       this.selectedFiles.clear();
    //       this.loadFiles();
    //     },
    //     error: (error) => {
    //       console.error('Error al eliminar los archivos:', error);
    //     },
    //     complete: () => {
    //       console.log('Eliminación completada');
    //     }
    //   });
    // }

  }

  getDocumentFiles(collection: string, documentId: string): void {
    console.log('Obteniendo archivos adjuntos...');
    this.loading = true;
    // this.archivoService.getFilesByActor(documentId).subscribe({
    //   next: (data) => {
    //     console.log('Datos obtenidos:', data);
    //     this.files = data;
    //     console.log('this.files', this.files);
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener los archivos adjuntos:', error);
    //   }
    // });

    // this.archivoService.getDocumentProperty(collectionName, documentId, 'archivosAdjuntos')
    this.archivoService.getDocumentFiles(collection, documentId)
      .subscribe({
        next: (data) => {
          console.log('Datos obtenidos:', data);
          this.files = data;
          this.loading = false;
          console.log('this.files', this.files);
          // Procesa los datos como sea necesario
        },
        error: (error) => {
          console.error('Error al obtener los datos:', error);
          this.loading = false;
        }
      });
  }

}