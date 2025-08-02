import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  errorMessage = '';

  // constructor(private authService: AuthService, private router: Router) {}
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada');
        // Redirigir al login si deseas
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      },
    });
  }

  // TEST AREA
  redirectToAngularJS(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToAngularJS();
    } else {
      this.errorMessage = 'Debes iniciar sesión primero';
    }
  }

  testRefreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        console.log('Token refrescado exitosamente', response);
        Swal.fire({
          title: 'Éxito',
          text: 'El token ha sido refrescado exitosamente.',
          icon: 'success',
        });
        // Aquí podrías manejar el nuevo token si es necesario
      },
      error: (error) => {
        console.error('Error al refrescar el token', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al refrescar el token. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
        this.errorMessage =
          error.message ||
          'Error al refrescar el token. Por favor, inténtalo de nuevo.';
      },
    });
  }

  testVerifyToken(): void {
    this.authService.verifyAuth().subscribe({
      next: (response) => {
        console.log('Token verificado exitosamente', response);
        Swal.fire({
          title: 'Éxito',
          text: 'Token verificado exitosamente.',
          icon: 'success',
        });
        // Aquí podrías manejar la respuesta de verificación si es necesario
      },
      error: (error) => {
        console.error('Error al verificar el token', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al verificar el token. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
        this.errorMessage =
          error.message ||
          'Error al verificar el token. Por favor, inténtalo de nuevo.';
      },
    });
  }
  // End of TEST AREA
}
