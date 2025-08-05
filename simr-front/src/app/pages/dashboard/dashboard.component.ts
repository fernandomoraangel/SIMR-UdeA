import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth.interface';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Propiedades reactivas conectadas directamente a los observables
  user$ = this.authService.user$;
  isAuthenticated$ = this.authService.isAuthenticated$;
  isLoading$ = this.authService.isLoading$;

  // Propiedades locales del componente
  protectedData: any = null;
  listaActores: any = null;
  loadingData = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    // private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📊 Dashboard: Componente inicializado');

    // Suscribirse a cambios de autenticación (opcional, ya que el guard protege)
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        console.log('📊 Dashboard: Estado de auth cambió:', isAuthenticated);

        if (!isAuthenticated) {
          console.log('📊 Dashboard: Usuario no autenticado, redirigiendo...');
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    console.log('📊 Dashboard: Cerrando sesión...');

    this.authService.logout().subscribe({
      next: () => {
        console.log('📊 Dashboard: Sesión cerrada exitosamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('📊 Dashboard: Error al cerrar sesión:', error);
        this.errorMessage = 'Error al cerrar sesión. Intenta nuevamente.';
        // Redirigir de todas formas al login
        this.router.navigate(['/login']);
      },
    });
  }

  loadProtectedData(): void {
    this.loadingData = true;
    this.errorMessage = '';

    // Usar el método de test del servicio o crear un endpoint específico
    this.authService.testGetAllUsers().subscribe({
      next: (users) => {
        console.log('📊 Dashboard: Datos cargados:', users.length, 'usuarios');
        this.protectedData = { users };
        this.loadingData = false;
      },
      error: (error) => {
        console.error('📊 Dashboard: Error al cargar datos:', error);
        this.errorMessage = 'Error al cargar los datos protegidos.';
        this.loadingData = false;

        // Si es error de autenticación, el servicio ya manejará la limpieza
        if (error.includes('401')) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  loadActores(): void {
    this.loadingData = true;
    this.errorMessage = '';

    // Usar el método de test del servicio o crear un endpoint específico
    this.authService.testGetAllActores().subscribe({
      next: (actores) => {
        console.log('📊 Dashboard: Datos cargados:', actores.length, 'actores');
        this.listaActores = { actores };
        console.log('📊 Dashboard: Lista de actores:', this.listaActores);
        this.loadingData = false;
      },
      error: (error) => {
        console.error('📊 Dashboard: Error al cargar datos:', error);
        this.errorMessage = 'Error al cargar los datos protegidos.';
        this.loadingData = false;

        // Si es error de autenticación, el servicio ya manejará la limpieza
        if (error.includes('401')) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  redirectToAngularJS(): void {
    this.authService.redirectToAngularJS();
  }

  redirectToLegacyApp(): void {
    // Usar el método del servicio para redireccionar a la app legacy
    this.authService.redirectToLegacyApp();
  }

  // Métodos helper para usar en el template
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  // TEST AREA
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
