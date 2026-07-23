import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginCredentials } from '../../../core/auth/auth.interface';
import { environment } from '@env/environment';

// const API_URL = environment.apiUrl;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  showTest = false; // Variable para mostrar el botón de prueba

  // Ruta legacy (AngularJS) a la que se debe regresar tras autenticarse,
  // provista por el middleware de auth-gating de simr-back
  // (app/middleware/legacyShellGuard.js) cuando un visitante anónimo
  // intenta acceder al shell legacy o a sus assets estáticos.
  private returnTo: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.returnTo = this.route.snapshot.queryParamMap.get('returnTo');

    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.goToDestination();
    }
  }

  // Tras un login exitoso: si se llegó aquí porque el backend legacy
  // bloqueó una visita anónima (ver legacyShellGuard.js), se regresa al
  // recurso legacy solicitado a través de /redirect-to-legacy (ya
  // autenticado, con la cookie de sesión recién emitida). En cualquier
  // otro caso, se mantiene el comportamiento original (ir al dashboard
  // de Angular 20).
  private goToDestination(): void {
    if (this.returnTo) {
      const backendOrigin = environment.originUrl;
      window.location.href = `${backendOrigin}/redirect-to-legacy?returnTo=${encodeURIComponent(
        this.returnTo
      )}`;
      return;
    }
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;
    // console.log('onSubmit(loginComponent)', username, password);
    const credentials: LoginCredentials = this.loginForm.value;
    console.log(
      'onSubmit(loginComponent)',
      credentials.username,
      credentials.password
    );

    this.authService.login(username, password).subscribe({
      next: (response) => {
        // Inicio de sesión exitoso
        console.log('Sesión iniciada con éxito', response);
        this.goToDestination();
        this.showTest = true;
      },
      error: (error) => {
        const message =
          (error as any)._authMessage ||
          error.message ||
          'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        this.errorMessage = message;
        this.isLoading = false;

        if (error.status === 401) {
          this.loginForm.get('password')?.reset();
        }
      },
    });
  }

  redirectToAngularJS(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToAngularJS();
    } else {
      this.errorMessage = 'Debes iniciar sesión primero';
    }
  }

  // TEST AREA
  testRefreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        console.log('Token refrescado exitosamente', response);
        // Aquí podrías manejar el nuevo token si es necesario
      },
      error: (error) => {
        console.error('Error al refrescar el token', error);
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
        // Aquí podrías manejar la respuesta de verificación si es necesario
      },
      error: (error) => {
        console.error('Error al verificar el token', error);
        this.errorMessage =
          error.message ||
          'Error al verificar el token. Por favor, inténtalo de nuevo.';
      },
    });
  }

  testLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada exitosamente');
        // this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión', error);
        this.errorMessage =
          error.message ||
          'Error al cerrar sesión. Por favor, inténtalo de nuevo.';
      },
    });
  }

  testGetAllUsers(): void {
    this.authService.testGetAllUsers().subscribe({
      next: (response) => {
        console.log('Usuarios obtenidos exitosamente', response);
        // Aquí podrías manejar la lista de usuarios si es necesario
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.errorMessage =
          error.message ||
          'Error al obtener usuarios. Por favor verifique autenticación.';
      },
    });
  }

  // End of TEST AREA
}
