import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchivoService } from '../services/archivo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-archivo-lista',
  templateUrl: './archivo-lista.component.html',
  styleUrls: ['./archivo-lista.component.css']
})
export class ArchivoListaComponent implements OnInit, OnDestroy {
  files: any[] = [];
  loading: boolean = false;
  selectedFiles: Set<string> = new Set();
  allSelected: boolean = false;
  selectedFileForViewing: string | null = null;

  private fileChangedSubscription: Subscription = new Subscription();

  constructor(private archivoService: ArchivoService) { }

  ngOnInit(): void {
    this.loadFiles();
    // this.fileUploadSubscription = this.archivoService.fileUploaded$.subscribe(() => {
    this.fileChangedSubscription = this.archivoService.fileChanged$.subscribe(() => {
      this.loadFiles();
    });
  }

  ngOnDestroy(): void {
    if (this.fileChangedSubscription) {
      this.fileChangedSubscription.unsubscribe();
    }
  }
  // ngOnDestroy(): void {
  //   if (this.fileUploadSubscription) {
  //     this.fileUploadSubscription.unsubscribe();
  //   }
  // }

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

  loadFiles(): void {
    this.loading = true;
    this.archivoService.getFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar archivos:', error);
        this.loading = false;
      }
    });
  }

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

  deleteFile(filename: string): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el archivo "${filename}"?`)) {
      this.archivoService.deleteFile(filename).subscribe({
        next: (response) => {
          console.log('Archivo eliminado con éxito:', response.message);
          this.loadFiles();
        },
        error: (error) => {
          console.error('Error al eliminar el archivo:', error);
        },
        complete: () => {
          console.log('Eliminación completada');
        }
      });
    }
  }

  deleteSelectedFiles(): void {
    if (this.selectedFiles.size === 0) {
      alert('Por favor, selecciona al menos un archivo para eliminar.');
      return;
    }

    const filesToDelete = Array.from(this.selectedFiles);
    if (confirm(`¿Estás seguro de que quieres eliminar ${filesToDelete.length} archivo(s)?`)) {
      this.archivoService.deleteMultipleFiles(filesToDelete).subscribe({
        next: (response) => {
          console.log('Archivos eliminados con éxito:', response.message);
          this.selectedFiles.clear();
          this.loadFiles();
        },
        error: (error) => {
          console.error('Error al eliminar los archivos:', error);
        },
        complete: () => {
          console.log('Eliminación completada');
        }
      });
    }
  }

  viewFile(filename: string): void {
    this.selectedFileForViewing = filename;
  }

}