import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { SignupCredentials } from '@core/auth/auth.interface';
import { SoundWaveComponent } from '@shared/sound-wave/sound-wave.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

export interface AuthDialogData {
  mode: 'login' | 'signup';
}

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    SoundWaveComponent,
  ],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css',
})
export class AuthDialogComponent {
  mode: 'login' | 'signup';
  loginForm: FormGroup;
  signupForm: FormGroup;
  otpForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  // Paso de doble factor
  showOtp = false;
  loginUserLabel = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialogRef: MatDialogRef<AuthDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AuthDialogData
  ) {
    this.mode = data?.mode ?? 'login';

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (response) => {
        // Diferimos las mutaciones de estado a un microtask para evitar NG0100
        // (ExpressionChangedAfterItHasBeenChecked) al alternar el paso OTP.
        Promise.resolve().then(() => {
          if (response.data && response.data.requiresTwoFactor) {
            // El backend pidió el código de doble factor: mostrar el paso OTP
            this.loginUserLabel =
              (response.data.user?.fullName || response.data.user?.username || username) || username;
            this.otpForm.reset();
            this.showOtp = true;
            this.isLoading = false;
            return;
          }
          this.onSuccess();
        });
      },
      error: (err) => this.onError(err),
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { code } = this.otpForm.value;
    this.authService.verifyTwoFactor(code).subscribe({
      next: () => {
        Promise.resolve().then(() => this.onSuccess());
      },
      error: (err) => this.onOtpError(err),
    });
  }

  backToLogin(): void {
    this.showOtp = false;
    this.isLoading = false;
    this.errorMessage = '';
  }

  submitSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const payload: SignupCredentials = this.signupForm.value;
    this.authService.signup(payload).subscribe({
      next: () => this.onSuccess(),
      error: (err) => this.onError(err),
    });
  }

  private onSuccess(): void {
    // Todo el cambio de estado + cierre se hace en un frame aparte para que
    // `isLoading` no cambie en medio del pase de detección (NG0100 en el
    // binding [disabled]="loginForm.invalid || isLoading").
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close('success');
      this.router.navigate(['/']);
    });
  }

  private onError(err: any): void {
    this.isLoading = false;
    if (typeof err === 'string') {
      this.errorMessage = err;
    } else if (err instanceof Error) {
      this.errorMessage = err.message || 'Ocurrió un error. Inténtalo de nuevo.';
    } else if (err.status === 401) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    } else {
      this.errorMessage = err._authMessage || err.message || 'Error al iniciar sesión';
    }
  }

  private onOtpError(err: any): void {
    this.isLoading = false;
    if (err?.status === 401) {
      this.errorMessage = 'El código es incorrecto';
    } else if (err?.status === 429) {
      this.errorMessage = 'Demasiados intentos fallidos. Vuelve a iniciar sesión.';
      this.showOtp = false;
    } else {
      this.errorMessage = err?._authMessage || err?.message || 'El código es incorrecto';
    }
  }
}
