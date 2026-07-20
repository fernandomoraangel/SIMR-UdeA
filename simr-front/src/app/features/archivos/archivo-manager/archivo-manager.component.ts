import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CapitalizeWordsPipe } from '../../../shared/pipes/capitalize-words.pipe';

import Swal from 'sweetalert2';

import { ArchivosService } from '../archivos.service';
import { ArchivoVistaComponent } from '../archivo-vista/archivo-vista.component';
import {
  FileBasicInfo,
  FileDeleteInfo,
  SelectedFileInfo,
} from '../models/archivo.interface';

/**
 * Componente reutilizable de gestión de archivos (Fase 2 de la migración).
 *
 * Reemplaza la directiva legacy `<archivo-manager>` y el puente popup +
 * postMessage + localStorage. Se incrusta directamente en los formularios
 * create/edit/detail de cualquier módulo que adjunte archivos, pasándole
 * `collection`, `documentId` y `documentName`.
 *
 * La asociación del archivo subido al documento padre queda a cargo del
 * módulo consumidor vía el evento `fileUploaded` (el backend `/files/upload`
 * crea el registro `Archivo` pero no lo enlaza al documento).
 */
@Component({
  selector: 'app-archivo-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
    CapitalizeWordsPipe,
  ],
  templateUrl: './archivo-manager.component.html',
  styleUrls: ['./archivo-manager.component.css'],
})
export class ArchivoManagerComponent implements OnInit, OnChanges {
  @Input() collection = '';
  @Input() documentId = '';
  @Input() documentName = '';

  @Output() fileUploaded = new EventEmitter<FileBasicInfo>();
  @Output() fileDeleted = new EventEmitter<FileDeleteInfo>();

  files: FileBasicInfo[] = [];
  loading = false;
  selectedFiles: SelectedFileInfo[] = [];
  allSelected = false;

  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  processingFile = false;

  constructor(private archivosService: ArchivosService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadDocumentFiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['documentId'] || changes['collection']) && this.documentId && this.collection) {
      this.loadDocumentFiles();
    }
  }

  loadDocumentFiles(): void {
    if (!this.collection || !this.documentId) {
      this.files = [];
      return;
    }
    this.loading = true;
    this.archivosService.getDocumentFiles(this.collection, this.documentId).subscribe({
      next: (data) => {
        this.files = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los archivos:', error);
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const sanitizedName = this.sanitizeFileName(file.name);
      if (sanitizedName !== file.name) {
        Swal.fire({
          title: 'Nombre de archivo modificado',
          text: `El nombre contenía caracteres no válidos y fue ajustado a: ${sanitizedName}`,
          icon: 'info',
          confirmButtonText: 'Aceptar',
        });
      }
      this.selectedFile = new File([file], sanitizedName, { type: file.type });
    }
    this.uploadProgress = 0;
    this.processingFile = false;
  }

  private sanitizeFileName(name: string): string {
    const invalidChars = /[<>:"|?*\\]/g;
    let sanitized = name.replace(invalidChars, '_');
    sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '_');
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
    if (!this.selectedFile) {
      return;
    }
    this.uploading = true;
    this.archivosService.uploadFile(this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === 'progress') {
          this.uploadProgress = event.progress;
          if (this.uploadProgress === 100) {
            this.processingFile = true;
          }
        } else if (event.type === 'response') {
          this.processingFile = false;
          this.uploading = false;
          this.uploadProgress = 0;
          const body = event.body || {};
          if (body.fileData) {
            const uploaded: FileBasicInfo = {
              id: body.documentId,
              name: body.fileData.minioObjectName,
              size: body.fileData.size,
              lastModified: body.fileData.uploadDate,
            };
            this.fileUploaded.emit(uploaded);
          }
          this.selectedFile = null;
          this.loadDocumentFiles();
          Swal.fire({
            title: '¡Éxito!',
            text: 'Archivo subido exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
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

  viewFile(filename: string): void {
    this.dialog.open(ArchivoVistaComponent, {
      width: '90%',
      height: '90%',
      data: { filename },
    });
  }

  downloadFile(filename: string): void {
    this.archivosService.downloadFile(filename);
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!bytes) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.selectedFiles = [];
    } else {
      this.selectedFiles = this.files.map((file) => ({ id: file.id, name: file.name }));
    }
    this.allSelected = !this.allSelected;
  }

  isAllSelected(): boolean {
    return this.files.length > 0 && this.selectedFiles.length === this.files.length;
  }

  toggleFileSelection(file: FileBasicInfo): void {
    const existing = this.selectedFiles.find((item) => item.id === file.id);
    if (existing) {
      this.selectedFiles = this.selectedFiles.filter((item) => item.id !== file.id);
    } else {
      this.selectedFiles.push({ id: file.id, name: file.name });
    }
    this.allSelected = this.isAllSelected();
  }

  isInSelectedFiles(fileId: string): boolean {
    return this.selectedFiles.some((item) => item.id === fileId);
  }

  deleteFile(file: FileBasicInfo): void {
    Swal.fire({
      title: '¡Advertencia de eliminación!',
      text: `¿Está seguro de que desea eliminar el archivo "${file.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const fileToDelete: FileDeleteInfo = {
          fileName: file.name,
          id: file.id,
          documentId: this.documentId,
        };
        this.archivosService.deleteFile(fileToDelete).subscribe({
          next: () => {
            this.fileDeleted.emit(fileToDelete);
            this.loadDocumentFiles();
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Archivo eliminado exitosamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
          },
          error: (error) => {
            console.error('Error al eliminar el archivo:', error);
            Swal.fire({
              title: '¡Error al eliminar el archivo!',
              text: 'No se pudo eliminar el archivo',
              icon: 'error',
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
    const filesToDelete: FileDeleteInfo[] = this.selectedFiles.map((file) => ({
      fileName: file['name'],
      id: file.id,
      documentId: this.documentId,
    }));
    Swal.fire({
      title: '¡Advertencia de eliminación!',
      text: `¿Está seguro de que desea eliminar ${filesToDelete.length} archivo(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivosService.deleteMultipleFiles(filesToDelete).subscribe({
          next: () => {
            this.fileDeleted.emit(filesToDelete[0]);
            this.selectedFiles = [];
            this.loadDocumentFiles();
            Swal.fire({
              title: '¡Éxito!',
              text: 'Eliminación exitosa',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
          },
          error: (error) => {
            console.error('Error al eliminar los archivos:', error);
            Swal.fire({
              title: '¡Error al eliminar los archivos',
              text: 'No se pudieron eliminar los archivos',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    });
  }
}
