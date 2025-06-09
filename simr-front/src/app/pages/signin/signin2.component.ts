import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { LoginCredentials } from '../../interfaces/auth.interface';

const base_url = environment.base_url;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signinForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signinForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    // const { username, password } = this.signinForm.value;
    // console.log('onSubmit(signinComponent)', username, password);
    const credentials: LoginCredentials = this.signinForm.value;
    console.log('onSubmit(signinComponent)', credentials.username, credentials.password);
    // this.authService.login(username, password).subscribe({
    this.authService.login(credentials).subscribe({
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

        const token = response.token;
        // Redireccionar con el token como parámetro
        window.location.href = `http://localhost:3000/#!/login-externo/?token=${token}`;
      },
      error: (error) => {
        // Manejo específico de error en el componente
        this.errorMessage =
          error.message ||
          'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        this.loading = false;

        // Acciones adicionales basadas en el tipo de error
        if (error.status === 401) {
          this.signinForm.get('password')?.reset();
          // Podrías también centrar el cursor en el campo de contraseña
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
