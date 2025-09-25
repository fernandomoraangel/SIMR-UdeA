import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DiccionariosStore } from '../../store/diccionarios.store';
import { AuthService } from '../../../../core/auth/auth.service';
import { DiccionariosService } from '@features/diccionarios/services/diccionarios.service';
import { Diccionario } from '@features/diccionarios/models/diccionario.interface';
import { SweetAlertService } from '@core/services/sweet-alert.service';

@Component({
  selector: 'app-diccionario-list',
  templateUrl: './diccionario-list.component.html',
  styleUrls: ['./diccionario-list.component.css'],
  // styleUrls: ['../diccionarios.styles.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [DiccionariosStore],
})
export class DiccionarioListComponent implements OnInit {
  // protected store = inject(DiccionariosStore);
  // protected authService = inject(AuthService);

  // ngOnInit(): void {
  //   this.store.loadDiccionarios();
  // }

  // onSearchChange(searchTerm: string): void {
  //   this.store.setSearchTerm(searchTerm);
  // }

  // onSort(property: string): void {
  //   this.store.setSorting(property);
  // }

  private router = inject(Router);
  private diccionarioService = inject(DiccionariosService);
  protected store = inject(DiccionariosStore);
  protected authService = inject(AuthService);
  private notificationService = inject(SweetAlertService);

  protected filteredDiccionarios = this.store.filteredAndSortedDiccionarios;

  constructor() {
    // Effect para recargar datos cuando sea necesario
    effect(() => {
      if (!this.store.diccionarios().length && !this.store.isLoading()) {
        this.loadDiccionarios();
      }
    });
  }

  ngOnInit() {
    this.loadDiccionarios();
  }

  private loadDiccionarios() {
    this.store.setLoading(true);
    // this.diccionarioService.getDiccionarios().subscribe({
    this.diccionarioService.findAll().subscribe({
      next: (diccionarios) => {
        this.store.setDiccionarios(diccionarios);
        this.store.setLoading(false);
      },
      error: (error) => {
        this.store.setError('Error al cargar los diccionarios');
        this.store.setLoading(false);
        console.error('Error loading diccionarios:', error);
      },
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.store.setSearchTerm(target.value);
  }

  onSort(property: string) {
    this.store.setSorting(property);
  }

  clearSearch() {
    this.store.setSearchTerm('');
  }

  navigateToCreate() {
    this.router.navigate(['/diccionarios/create']);
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/diccionarios', id]);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/diccionarios', id, 'edit']);
  }

  async onDelete(diccionario: Diccionario) {
    const confirmed = await this.notificationService.confirm(
      '¿Realmente desea borrar el registro?',
      '¡Advertencia de eliminación!'
    );

    if (confirmed && diccionario._id) {
      // this.diccionarioService.deleteDiccionario(diccionario._id).subscribe({
      this.diccionarioService.delete(diccionario._id).subscribe({
        next: () => {
          // this.store.removeDiccionario(diccionario._id!);
          this.notificationService.success(
            'El registro se ha eliminado correctamente',
            'Eliminación exitosa'
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Error al eliminar el registro',
            'Error'
          );
          console.error('Error deleting diccionario:', error);
        },
      });
    }
  }
}
