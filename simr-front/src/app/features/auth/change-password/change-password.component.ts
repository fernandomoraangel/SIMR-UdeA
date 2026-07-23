import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
  standalone: false,
})
export class ChangePasswordComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly apiUrl = `${environment.apiUrl}/auth/change-password`;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post<{ success: boolean; message: string }>(this.apiUrl, {
        currentPassword: this.form.value.currentPassword,
        newPassword: this.form.value.newPassword,
      }, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message;
          this.form.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al cambiar la contraseña';
        },
      });
  }
}
