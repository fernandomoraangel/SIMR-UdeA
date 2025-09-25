import { Component, Input, Inject, OnChanges, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArchivosService } from '../archivos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-archivo-vista',
  templateUrl: './archivo-vista.component.html',
  styleUrls: ['./archivo-vista.component.css'],
  standalone: false,
})
export class ArchivoVistaComponent implements OnInit {
  // @Input() filename: string = '';
  filename: string = '';
  fileUrl: string = '';
  fileType: string = '';
  safeUrl: SafeResourceUrl = '';

  constructor(
    private archivosService: ArchivosService,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ArchivoVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { filename: string }
  ) {}

  ngOnInit(): void {
    if (this.data.filename) {
      this.filename = this.data.filename;
      this.fileUrl = this.archivosService.getFileUrl(this.filename);
      this.fileType = this.archivosService.getFileType(this.filename);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.fileUrl
      );
    }
  }

  openInNewTab(): void {
    window.open(this.fileUrl, '_blank');
  }

  downloadFile(filename: string): void {
    this.archivosService.downloadFile(filename);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
