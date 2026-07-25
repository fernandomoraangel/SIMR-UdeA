import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ListasService, Lista } from '../listas.service';
import { AuthorizationService } from '@core/services/authorization.service';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listas-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './listas-admin.component.html',
  styleUrl: './listas-admin.component.css',
})
export class ListasAdminComponent implements OnInit {
  listas: Lista[] = [];
  selected: Lista | null = null;
  filtro = '';
  filtroElementos = '';

  loading = false;
  error = '';

  newElement = '';
  newElementSigla = '';
  newElementFrase = '';

  editIndex: number | null = null;
  editValue = '';
  editSigla = '';
  editFrase = '';

  constructor(
    private listasService: ListasService,
    private authz: AuthorizationService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get canWrite(): boolean {
    return this.authz.hasAnyRole(['admin', 'bibliotecologo']);
  }

  get filteredListas(): Lista[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) {
      return this.listas;
    }
    return this.listas.filter((l) => l.nombre_lista.toLowerCase().includes(f));
  }

  get isNNormalizados(): boolean {
    return !!this.selected && this.selected.nombre_lista === 'nNormalizados';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.listasService.list().subscribe({
      next: (data) => {
        this.listas = data.sort((a, b) =>
          a.nombre_lista.localeCompare(b.nombre_lista)
        );
        if (!this.selected && this.listas.length) {
          this.selected = this.listas[0];
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  select(lista: Lista): void {
    this.selected = lista;
    this.filtroElementos = '';
    this.cancelEdit();
    this.newElement = '';
    this.newElementSigla = '';
    this.newElementFrase = '';
  }

  clearFilter(): void {
    this.filtro = '';
  }

  clearElementFilter(): void {
    this.filtroElementos = '';
  }

  get filteredElementIndices(): number[] {
    if (!this.selected) return [];
    const f = this.filtroElementos.trim().toLowerCase();
    const all = this.selected.elementos
      .map((_, i) => i)
      .sort((a, b) => this.elementLabel(this.selected!, a).localeCompare(this.elementLabel(this.selected!, b)));
    if (!f) return all;
    return all.filter((i) => this.elementLabel(this.selected!, i).toLowerCase().includes(f));
  }

  // ===== Elementos =====
  addElement(): void {
    if (!this.selected) {
      return;
    }
    if (this.isNNormalizados) {
      if (!this.newElementSigla.trim()) {
        this.snack.open('La sigla es obligatoria.', 'Cerrar', {
          duration: 2500,
        });
        return;
      }
      const payload = {
        elemento: this.newElementSigla.trim(),
        metadata: {
          sigla: this.newElementSigla.trim(),
          frase: this.newElementFrase.trim(),
        },
      };
      this.listasService.addElement(this.selected.nombre_lista, payload).subscribe({
        next: (updated) => this.replaceSelected(updated),
        error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
      });
      this.newElementSigla = '';
      this.newElementFrase = '';
    } else {
      if (!this.newElement.trim()) {
        this.snack.open('El elemento no puede estar vacío.', 'Cerrar', {
          duration: 2500,
        });
        return;
      }
      this.listasService
        .addElement(this.selected.nombre_lista, { elemento: this.newElement.trim() })
        .subscribe({
          next: (updated) => this.replaceSelected(updated),
          error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
        });
      this.newElement = '';
    }
  }

  startEdit(index: number, value: string, sigla?: string, frase?: string): void {
    this.editIndex = index;
    this.editValue = value;
    this.editSigla = sigla ?? '';
    this.editFrase = frase ?? '';
  }

  saveEdit(): void {
    if (!this.selected || this.editIndex === null) {
      return;
    }
    const value = this.isNNormalizados
      ? this.editSigla.trim()
      : this.editValue.trim();
    if (!value) {
      this.snack.open('El valor no puede estar vacío.', 'Cerrar', {
        duration: 2500,
      });
      return;
    }
    const payload = this.isNNormalizados
      ? {
          elemento: this.editSigla.trim(),
          metadata: { sigla: this.editSigla.trim(), frase: this.editFrase.trim() },
        }
      : { elemento: this.editValue.trim() };
    this.listasService
      .updateElement(this.selected._id!, this.editIndex, payload)
      .subscribe({
        next: (updated) => {
          this.replaceSelected(updated);
          this.cancelEdit();
        },
        error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
      });
  }

  cancelEdit(): void {
    this.editIndex = null;
    this.editValue = '';
    this.editSigla = '';
    this.editFrase = '';
  }

  deleteElement(index: number): void {
    if (!this.selected) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar elemento',
        message: '¿Confirma eliminar este elemento de la lista?',
        confirmText: 'Eliminar',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok || !this.selected) {
        return;
      }
      this.listasService
        .deleteElement(this.selected._id!, index)
        .subscribe({
          next: (updated) => this.replaceSelected(updated),
          error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
        });
    });
  }

  deleteLista(): void {
    if (!this.selected) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar lista',
        message: `¿Confirma eliminar la lista "${this.selected.nombre_lista}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar lista',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok || !this.selected) {
        return;
      }
      this.listasService.remove(this.selected._id!).subscribe({
        next: () => {
          this.snack.open('Lista eliminada.', 'Cerrar', { duration: 2500 });
          this.selected = null;
          this.load();
        },
        error: (err) => this.snack.open(err, 'Cerrar', { duration: 3000 }),
      });
    });
  }

  private replaceSelected(updated: Lista): void {
    const idx = this.listas.findIndex((l) => l._id === updated._id);
    if (idx >= 0) {
      this.listas[idx] = updated;
      this.selected = updated;
    }
  }

  elementLabel(lista: Lista, index: number): string {
    if (lista.nombre_lista === 'nNormalizados' && lista.metadata?.[index]) {
      const m = lista.metadata[index];
      return m.frase ? `${m.sigla} — ${m.frase}` : m.sigla;
    }
    return lista.elementos[index];
  }
}
