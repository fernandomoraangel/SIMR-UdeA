import { Component, Input, OnChanges } from '@angular/core';
import { ArchivoService } from '../archivo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-archivo-vista',
  templateUrl: './archivo-vista.component.html',
  styleUrls: ['./archivo-vista.component.css']
})
export class ArchivoVistaComponent implements OnChanges {
  @Input() filename: string = '';
  fileUrl: string = '';
  fileType: string = '';
  safeUrl: SafeResourceUrl = '';

  constructor(private archivoService: ArchivoService, private sanitizer: DomSanitizer) { }

  ngOnChanges(): void {
    if (this.filename) {
      this.fileUrl = this.archivoService.getFileUrl(this.filename);
      this.fileType = this.archivoService.getFileType(this.filename);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
    }
  }
}