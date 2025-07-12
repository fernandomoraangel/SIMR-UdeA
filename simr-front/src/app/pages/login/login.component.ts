import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { LoginCredentials } from '../../interfaces/auth.interface';

const base_url = environment.base_url;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  showTest = false; // Variable para mostrar el botón de prueba

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
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
    // this.authService.login(username, password).subscribe({
    // this.authService.login(credentials).subscribe({
    this.authService.login(username, password).subscribe({
      next: (response) => {
        // Inicio de sesión exitoso
        console.log('Sesión iniciada con éxito', response);
        // this.router.navigate(['/dashboard']);
        // this.router.navigate([base_url]);

        // const token = response.token;
        // Redireccionar con el token como parámetro
        // window.location.href = `http://localhost:3000/?token=${token}`;

        // Redireccionar a la aplicación AngularJS
        // window.location.href = 'http://localhost:3000';
        // Alternativa: window.location.replace('http://localhost:3000');

        // Guarda temporalmente los datos de autenticación
        // sessionStorage.setItem(
        //   'temp_auth_transfer',
        //   JSON.stringify({
        //     token: response.token,
        //     user: response.user,
        //   })
        // );

        // Crea y envía un formulario POST automáticamente
        // this.redirectWithPostData('http://localhost:3000/auth-receiver', {
        //   transferKey: 'temp_auth_transfer',
        // });

        // const sessionData = {
        //   token: response.token,
        //   user: response.user,
        // };

        // const iframe = document.getElementById(
        //   'angularjs-frame'
        // ) as HTMLIFrameElement;

        // if (iframe && iframe.contentWindow) {
        //   iframe.contentWindow.postMessage(
        //     sessionData,
        //     'http://localhost:3000'
        //   );
        // }

        const accessToken = response.data.tokens?.accessToken;
        // Redireccionar con el token como parámetro
        // window.location.href = `http://localhost:3000/#!/login-externo/?token=${accessToken}`;
        this.showTest = true;
      },
      error: (error) => {
        // Manejo específico de error en el componente
        this.errorMessage =
          error.message ||
          'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        this.isLoading = false;

        // Acciones adicionales basadas en el tipo de error
        if (error.status === 401) {
          this.loginForm.get('password')?.reset();
          // Podrías también centrar el cursor en el campo de contraseña
        }
      },
      complete: () => {
        this.isLoading = false;
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
          error.message || 'Error al refrescar el token. Por favor, inténtalo de nuevo.';
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
          error.message || 'Error al verificar el token. Por favor, inténtalo de nuevo.';
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
          error.message || 'Error al cerrar sesión. Por favor, inténtalo de nuevo.';
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
          error.message || 'Error al obtener usuarios. Por favor verifique autenticación.';
      },
    });
  }

  // End of TEST AREA



}
