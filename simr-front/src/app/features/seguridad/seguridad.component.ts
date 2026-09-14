import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QrSvgComponent } from '@shared/qr-svg/qr-svg.component';

/**
 * Configuración del doble factor de autenticación (TOTP).
 * Permite ver el QR, escanearlo con un autenticador (p. ej. Microsoft
 * Authenticator), activarlo y desactivarlo. Muestra los códigos de respaldo
 * una única vez durante el alta.
 */
@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    QrSvgComponent,
  ],
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css'],
})
export class SeguridadComponent implements OnInit {
  twoFactorEnabled = false;
  setupStarted = false;

  otpauthUri = '';
  secret = '';
  backupCodes: string[] = [];
  codesRevealed = false;

  showCodes = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  enableForm: FormGroup;
  disableForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.enableForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ],
      ],
    });
    this.disableForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.refreshStatus();
  }

  /**
   * Fuerza el repintado de la vista. Es necesario porque un error de
   * change detection en otro componente (p. ej. NG0100 al cerrar el diálogo
   * de login) puede dejar el ciclo automático degradado y esta página no
   * se refrescaría tras recibir la respuesta del servidor.
   */
  private refrescarVista(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // Si ya hay un ciclo de detección en curso, se ignora sin romper nada.
      this.cdr.markForCheck();
    }
  }

  private refreshStatus(): void {
    this.authService.twoFactorStatus().subscribe({
      next: (res) => {
        this.twoFactorEnabled = !!res.data?.twoFactorEnabled;
        this.setupStarted = this.twoFactorEnabled; // si ya está activo, no iniciar setup de nuevo
        this.refrescarVista();
      },
      error: () => {
        this.twoFactorEnabled = false;
        this.setupStarted = false;
        this.refrescarVista();
      },
    });
  }

  iniciarSetup(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.codesRevealed = false;

    // `finalize` garantiza que isLoading siempre se apague (éxito o error),
    // y `timeout` evita quedarse "Generando…" para siempre si el request cuelga.
    this.authService
      .setupTwoFactor()
      .pipe(
        timeout(20000),
        finalize(() => {
          this.isLoading = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: (res) => {
          this.setupStarted = true;
          this.otpauthUri = res.data?.otpauthUri || '';
          this.secret = res.data?.secret || '';
          this.backupCodes = res.data?.backupCodes || [];
          this.showCodes = true;
          this.enableForm.reset();
          this.refrescarVista();
        },
        error: (err) => {
          const isTimeout =
            typeof err === 'string' &&
            /timed out|timeout/i.test(String(err));
          if (isTimeout) {
            this.errorMessage =
              'La configuración tardó demasiado. Comprueba la conexión con el servidor y vuelve a intentarlo.';
          } else {
            this.errorMessage =
              err?._authMessage ||
              err?.message ||
              err ||
              'No se pudo iniciar la configuración del doble factor.';
          }
          this.refrescarVista();
        },
      });
  }

  confirmarActivacion(): void {
    if (this.enableForm.invalid) {
      this.enableForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { code } = this.enableForm.value;
    this.authService
      .enableTwoFactor(code)
      .pipe(
        timeout(20000),
        finalize(() => {
          this.isLoading = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: () => {
          this.twoFactorEnabled = true;
          this.setupStarted = true;
          this.successMessage =
            'Doble factor activado correctamente. Guarda tus códigos de respaldo en un lugar seguro.';
          this.refrescarVista();
        },
        error: (err) => {
          this.errorMessage =
            err?._authMessage || err?.message || 'El código es incorrecto';
          this.refrescarVista();
        },
      });
  }

  desactivar(): void {
    if (this.disableForm.invalid) {
      this.disableForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { code } = this.disableForm.value;
    this.authService
      .disableTwoFactor(code)
      .pipe(
        timeout(20000),
        finalize(() => {
          this.isLoading = false;
          this.refrescarVista();
        })
      )
      .subscribe({
        next: () => {
          this.twoFactorEnabled = false;
          this.setupStarted = false;
          this.otpauthUri = '';
          this.secret = '';
          this.backupCodes = [];
          this.showCodes = false;
          this.disableForm.reset();
          this.successMessage = 'Doble factor desactivado.';
          this.refrescarVista();
        },
        error: (err) => {
          this.errorMessage =
            err?._authMessage || err?.message || 'El código es incorrecto';
          this.refrescarVista();
        },
      });
  }
}