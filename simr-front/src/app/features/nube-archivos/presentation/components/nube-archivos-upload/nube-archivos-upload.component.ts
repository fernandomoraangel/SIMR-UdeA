import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NubeArchivosService } from '../../../data/nube-archivos.service';
import { SweetAlertService } from '@core/services/sweet-alert.service';

@Component({
  selector: 'app-nube-archivos-upload',
  templateUrl: './nube-archivos-upload.component.html',
  styleUrl: './nube-archivos-upload.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
})
export class NubeArchivosUploadComponent {
  selectedFile: File | null = null;
  tags = '';
  isLoading = false;
  errorMessage = '';
  dragOver = false;

  readonly dialogRef = inject(MatDialogRef<NubeArchivosUploadComponent>);
  private readonly sweetAlert = inject(SweetAlertService);

  constructor(public service: NubeArchivosService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      this.errorMessage = '';
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  submit(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.service.upload(this.selectedFile, this.tags).subscribe({
      next: () => {
        this.isLoading = false;
        this.sweetAlert.success('Archivo subido', `${this.selectedFile!.name} se subió correctamente`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al subir el archivo';
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
