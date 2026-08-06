import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NubeArchivosService } from '../../../data/nube-archivos.service';
import { NubeArchivo, TagCount } from '../../../models/nube-archivo.interface';

export interface NubeArchivosTagsDialogData {
  file: NubeArchivo;
  availableTags: TagCount[];
}

@Component({
  selector: 'app-nube-archivos-tags-dialog',
  templateUrl: './nube-archivos-tags-dialog.component.html',
  styleUrl: './nube-archivos-tags-dialog.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
  ],
})
export class NubeArchivosTagsDialogComponent {
  readonly data = inject<NubeArchivosTagsDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<NubeArchivosTagsDialogComponent>);

  file = this.data.file;
  tags: string[] = [...this.data.file.tags];
  newTag = '';
  isLoading = false;
  errorMessage = '';

  constructor(public service: NubeArchivosService) {}

  get tagSuggestions(): string[] {
    const q = this.newTag.trim().toLowerCase();
    const current = new Set(this.tags);
    return this.data.availableTags
      .map((t) => t.tag)
      .filter((t) => !current.has(t) && (!q || t.includes(q)))
      .slice(0, 20);
  }

  addTag(tag?: string): void {
    const t = (tag ?? this.newTag).trim().toLowerCase();
    if (t && !this.tags.includes(t)) {
      this.tags = [...this.tags, t];
    }
    this.newTag = '';
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  save(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service.updateTags(this.file._id, this.tags).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(this.tags);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'No se pudieron guardar las etiquetas';
      },
    });
  }
}
