import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DiccionariosService } from '../../services/diccionarios.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { Diccionario } from '../../models/diccionario.interface';
import { User } from '@core/auth/auth.interface';

@Component({
  selector: 'app-diccionario-detail',
  templateUrl: './diccionario-detail.component.html',
  styleUrls: ['./diccionario-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class DiccionarioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private diccionariosService = inject(DiccionariosService);
  protected authService = inject(AuthService);
  private sweetAlert = inject(SweetAlertService);

  // Signals para el estado
  protected diccionario = signal<Diccionario | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadDiccionario(id);
      }
    });
  }

  private loadDiccionario(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.diccionariosService.findOne(id).subscribe({
      next: (diccionario) => {
        this.diccionario.set(diccionario);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el diccionario');
        this.isLoading.set(false);
      },
    });
  }

  protected canEdit(): boolean {
    // const currentUser: User | null = this.authService.user$;
    const currentUser = this.authService.getCurrentUser();
    const diccionario = this.diccionario();

    return !!(
      currentUser &&
      diccionario &&
      currentUser.id === diccionario.creador?.id
    );
  }

  onDelete(event: Event): void {
    event.preventDefault();

    const diccionario = this.diccionario();
    if (!diccionario?._id) return;

    this.sweetAlert
      .confirm(
        '¡Advertencia de eliminación!',
        '¿Realmente desea borrar el registro?',
        'Confirmar',
        'Cancelar'
      )
      .then((result) => {
        if (result.isConfirmed && diccionario._id) {
          this.diccionariosService.delete(diccionario._id).subscribe({
            next: () => {
              this.sweetAlert.success(
                'Eliminación exitosa!',
                'El registro se ha eliminado correctamente'
              );
              this.router.navigate(['/diccionarios']);
            },
            error: (error) => {
              this.sweetAlert.error('Error', 'No se pudo eliminar el registro');
            },
          });
        }
      });
  }
}
