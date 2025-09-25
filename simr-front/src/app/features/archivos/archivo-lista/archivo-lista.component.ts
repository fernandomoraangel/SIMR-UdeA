import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ArchivosService } from '../archivos.service';
import { ArchivoVistaComponent } from '../archivo-vista/archivo-vista.component';
import {
  FileBasicInfo,
  FileDeleteInfo,
  FileDocumentInfo,
  SelectedFileInfo,
  SharedMessageData,
} from '../models/archivo.interface';

@Component({
  selector: 'app-archivo-lista',
  templateUrl: './archivo-lista.component.html',
  styleUrls: ['./archivo-lista.component.css'],
  standalone: false,
})
export class ArchivoListaComponent implements OnInit, OnDestroy {
  // files: any[] = [];
  files: FileBasicInfo[] = [];
  loading: boolean = false;
  selectedFiles: SelectedFileInfo[] = [];
  // selectedFiles: Set<string> = new Set();
  // selectedFiles: Set<FileDocumentInfo> = new Set();
  allSelected: boolean = false;
  selectedFileForViewing: string | null = null;

  dbCollection: string = '';
  documentId: string = '';
  documentName: string = '';

  private fileChangedSubscription: Subscription = new Subscription();

  // Comunicacion con AngularJS por PostMessages
  messageFromAngularJS: string = '';
  messageToAngularJS: SharedMessageData = { type: '', status: '', message: '' };
  angularJSOrigin = 'http://localhost:3000'; // Dominio de la app AngularJS
  private messageListener: any;

  constructor(
    private dialog: MatDialog,
    private archivosService: ArchivosService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.messageListener = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageListener, false);
    this.messageToAngularJS = {
      type: 'FILE_LIST',
      status: 'READY',
      message: 'Hola desde Angular!',
    };
    window.opener.postMessage(this.messageToAngularJS, this.angularJSOrigin);
    this.fileChangedSubscription = this.archivosService.fileChanged$.subscribe(
      () => {
        this.loadDocumentFiles(this.dbCollection, this.documentId);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.fileChangedSubscription) {
      this.fileChangedSubscription.unsubscribe();
    }
    window.removeEventListener('message', this.messageListener);
  }

  viewFile(fileName: string) {
    this.dialog.open(ArchivoVistaComponent, {
      width: '90%',
      height: '90%',
      data: { filename: fileName },
    });
  }

  receiveMessage(event: MessageEvent) {
    if (event.origin !== this.angularJSOrigin) {
      // console.log('Origen no permitido', this.angularJSOrigin, '!=', event.origin);
      return;
    }

    // console.log('Origen permitido', this.angularJSOrigin, '==', event.origin);

    this.ngZone.run(() => {
      this.messageFromAngularJS = event.data;
    });

    if (event.data && event.data.type === 'FILE_LIST') {
      this.documentId = event.data.message.documentId;
      this.documentName = event.data.message.documentName;
      this.dbCollection = event.data.message.dbCollection;
      this.loadDocumentFiles(this.dbCollection, this.documentId);
    }
  }

  sendMessage(myMessage: string | SharedMessageData): void {
    // Para ventanas emergentes
    if (window.opener) {
      window.opener.postMessage(myMessage, this.angularJSOrigin);
    } else if (window.parent) {
      // Para iframes
      window.parent.postMessage(myMessage, this.angularJSOrigin);
    }
  }

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.selectedFiles = [];
    } else {
      this.files.forEach((file) => {
        const fileSelected: SelectedFileInfo = {
          id: file.id,
          name: file.name,
        };
        this.selectedFiles.push(fileSelected);
      });
    }
    this.allSelected = !this.allSelected;
  }

  isAllSelected(): boolean {
    return this.selectedFiles.length === this.files.length;
  }

  updateAllSelected(): void {
    this.allSelected = this.isAllSelected();
  }

  botonPrueba(): void {
    console.log('selectedFiles:', this.selectedFiles);
  }

  isInSelectedFiles(fileId: string): boolean {
    return this.selectedFiles.find((item) => item.id === fileId) !== undefined;
  }

  // toggleFileSelection(fileId: string): void {
  toggleFileSelection(file: FileBasicInfo): void {
    const existingItem = this.selectedFiles.find((item) => item.id === file.id);
    if (existingItem) {
      this.selectedFiles = this.selectedFiles.filter(
        (item) => item.id !== file.id
      );
    } else {
      const fileSelected: SelectedFileInfo = {
        id: file.id,
        name: file.name,
      };
      this.selectedFiles.push(fileSelected);
    }
    this.updateAllSelected();
  }

  downloadFile(filename: string): void {
    this.archivosService.downloadFile(filename);
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  deleteFile(fileInfo: FileBasicInfo): void {
    Swal.fire({
      title: '¡Advertencia de eliminación!',
      text: `¿Estás seguro de que quiere eliminar el archivo "${fileInfo.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const fileToDelete: FileDeleteInfo = {
          fileName: fileInfo.name,
          id: fileInfo.id,
          documentId: this.documentId,
        };
        // this.archivosService.deleteFile(fileInfo.name, fileInfo.id, this.documentId).subscribe({
        this.archivosService.deleteFile(fileToDelete).subscribe({
          next: (response) => {
            console.log('Archivo eliminado con éxito:', response.message);
            const fileDeleted: FileDocumentInfo = {
              id: fileInfo.id,
              name: fileInfo.name,
              documentId: this.documentId,
            };
            this.sendMessage({
              type: 'FILE_DELETED',
              status: 'SUCCESS',
              message: JSON.stringify(fileDeleted),
            });
          },
          error: (error) => {
            console.error('Error al eliminar el archivo:', error);
            Swal.fire({
              title: '¡Error al eliminar el archivo!',
              text: error,
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
          complete: () => {
            console.log('Eliminación completada');
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Archivo eliminado exitosamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    });
  }

  deleteSelectedFiles(): void {
    if (this.selectedFiles.length === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Por favor, seleccione al menos un archivo para eliminar',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
    let filesToDelete: FileDeleteInfo[] = [];
    this.selectedFiles.forEach((file) => {
      filesToDelete.push({
        fileName: file['name'],
        id: file.id,
        documentId: this.documentId,
      });
    });
    Swal.fire({
      title: '¡Advertencia de eliminación!',
      text: `¿Estás seguro de que quiere eliminar ${filesToDelete.length} archivo(s) ? `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivosService.deleteMultipleFiles(filesToDelete).subscribe({
          next: (response) => {
            console.log('Archivos eliminados con éxito:', response.message);
            // this.selectedFiles.clear();
            this.selectedFiles = [];
          },
          error: (error) => {
            console.error('Error al eliminar los archivos:', error);
            Swal.fire({
              title: '¡Error al eliminar los archivos',
              text: error,
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
          complete: () => {
            console.log('Eliminación completada');
            Swal.fire({
              title: '¡Éxito!',
              text: 'Eliminación exitosa',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    });
  }

  loadDocumentFiles(collection: string, documentId: string): void {
    console.log('Obteniendo archivos adjuntos...');
    this.loading = true;
    this.archivosService.getDocumentFiles(collection, documentId).subscribe({
      next: (data) => {
        console.log('Datos obtenidos:', data);
        this.files = data;
        this.loading = false;
        console.log('this.files', this.files);
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
        this.loading = false;
      },
    });
  }
}
