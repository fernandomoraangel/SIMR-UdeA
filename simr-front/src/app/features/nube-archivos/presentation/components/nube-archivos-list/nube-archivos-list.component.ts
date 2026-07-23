import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NubeArchivosService } from '../../../data/nube-archivos.service';
import { NubeArchivo, TagCount } from '../../../models/nube-archivo.interface';
import { NubeArchivosUploadComponent } from '../nube-archivos-upload/nube-archivos-upload.component';
import { SweetAlertService } from '@core/services/sweet-alert.service';

@Component({
  selector: 'app-nube-archivos-list',
  templateUrl: './nube-archivos-list.component.html',
  styleUrl: './nube-archivos-list.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
})
export class NubeArchivosListComponent implements OnInit {
  files: NubeArchivo[] = [];
  total = 0;
  page = 1;
  limit = 50;
  isLoading = false;

  searchTerm = '';
  selectedTags: string[] = [];
  availableTags: TagCount[] = [];
  showTagFilter = false;

  editingTagsId: string | null = null;
  editingTagsValue = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly dialog = inject(MatDialog);
  private readonly sweetAlert = inject(SweetAlertService);

  constructor(public service: NubeArchivosService) {}

  ngOnInit(): void {
    this.loadFiles();
    this.loadTags();
  }

  loadFiles(): void {
    this.isLoading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedTags.length) params.tags = this.selectedTags.join(',');

    this.service.list(params).subscribe({
      next: (res) => {
        this.files = res.data.files;
        this.total = res.data.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadTags(): void {
    this.service.getAllTags().subscribe({
      next: (res) => {
        this.availableTags = res.data;
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadFiles();
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.page = 1;
    this.loadFiles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTags = [];
    this.page = 1;
    this.loadFiles();
  }

  openUpload(): void {
    const ref = this.dialog.open(NubeArchivosUploadComponent, {
      width: '500px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.page = 1;
        this.loadFiles();
        this.loadTags();
      }
    });
  }

  downloadFile(file: NubeArchivo): void {
    const url = this.service.downloadUrl(file._id);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  startEditTags(file: NubeArchivo): void {
    this.editingTagsId = file._id;
    this.editingTagsValue = file.tags.join(', ');
  }

  saveTags(file: NubeArchivo): void {
    const tags = this.editingTagsValue.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    this.service.updateTags(file._id, tags).subscribe({
      next: () => {
        file.tags = tags;
        this.editingTagsId = null;
        this.loadTags();
      },
      error: () => {
        this.sweetAlert.showError('Error', 'No se pudieron actualizar las etiquetas');
      },
    });
  }

  cancelEditTags(): void {
    this.editingTagsId = null;
  }

  confirmDelete(file: NubeArchivo): void {
    this.sweetAlert.showConfirm('Eliminar archivo', `¿Eliminar "${file.originalName}"?`).then((confirmed) => {
      if (confirmed) {
        this.service.remove(file._id).subscribe({
          next: () => {
            this.files = this.files.filter(f => f._id !== file._id);
            this.total--;
            this.loadTags();
          },
          error: () => {
            this.sweetAlert.showError('Error', 'No se pudo eliminar el archivo');
          },
        });
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFileIcon(mime: string): string {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'videocam';
    if (mime.startsWith('audio/')) return 'audiotrack';
    if (mime.includes('pdf')) return 'picture_as_pdf';
    if (mime.includes('word') || mime.includes('document')) return 'description';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'table_chart';
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return 'folder_zip';
    return 'insert_drive_file';
  }

  totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  changePage(delta: number): void {
    this.page += delta;
    this.loadFiles();
  }
}
