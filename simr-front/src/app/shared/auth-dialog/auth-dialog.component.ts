import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

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
      next: () => this.onSuccess(),
      error: (err) => this.onError(err),
      complete: () => (this.isLoading = false),
    });
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
      complete: () => (this.isLoading = false),
    });
  }

  private onSuccess(): void {
    this.dialogRef.close('success');
    this.router.navigate(['/']);
  }

  private onError(err: string): void {
    this.errorMessage = err || 'Ocurrió un error. Inténtalo de nuevo.';
  }
}
