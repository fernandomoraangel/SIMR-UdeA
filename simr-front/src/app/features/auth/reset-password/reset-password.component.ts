import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  standalone: false,
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  token = '';

  private readonly apiUrl = `${environment.apiUrl}/auth/reset-password`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Token de restablecimiento no encontrado';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.value.password !== this.form.value.confirmPassword) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .post<{ success: boolean; message: string }>(this.apiUrl, {
        token: this.token,
        password: this.form.value.password,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al restablecer la contraseña';
        },
      });
  }
}
