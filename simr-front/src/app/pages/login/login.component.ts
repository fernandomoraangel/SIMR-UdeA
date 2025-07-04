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
    console.log('onSubmit(loginComponent)', credentials.username, credentials.password);
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

        const accessToken = response.tokens?.accessToken;
        // Redireccionar con el token como parámetro
        window.location.href = `http://localhost:3000/#!/login-externo/?token=${accessToken}`;
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
}