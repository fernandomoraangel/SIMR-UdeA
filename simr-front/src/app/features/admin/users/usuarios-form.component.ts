import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { User, Role } from '@core/models/user.model';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <h1 class="admin-title">{{ isEdit ? 'Editar' : 'Crear' }} usuario</h1>
        <button mat-button routerLink="/admin/usuarios"><mat-icon>arrow_back</mat-icon> Volver</button>
      </header>

      <mat-card appearance="outlined" *ngIf="!loading">
        <form (ngSubmit)="guardar()" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="model.username" name="username" required [disabled]="isEdit" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Correo</mat-label>
            <input matInput type="email" [(ngModel)]="model.email" name="email" required />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" [(ngModel)]="model.password" name="password"
              [required]="!isEdit" placeholder="{{ isEdit ? 'Dejar en blanco para mantener' : '' }}" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput [(ngModel)]="model.firstName" name="firstName" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput [(ngModel)]="model.lastName" name="lastName" />
          </mat-form-field>

          <div class="roles-panel">
            <h3>Roles asignados</h3>
            <mat-checkbox *ngFor="let r of allRoles" [checked]="selectedRoles.includes(r.id!)"
              (change)="toggleRole(r)">
              {{ r.displayName || r.name }}
            </mat-checkbox>
          </div>

          <div class="form-acciones">
            <button mat-flat-button color="primary" type="submit" [disabled]="saving">
              {{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}
            </button>
          </div>
        </form>
      </mat-card>
      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 720px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
      .form-grid { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
      .roles-panel { margin: 12px 0; }
      .roles-panel h3 { font-family: var(--simr-body); color: var(--simr-tinta); margin: 0 0 8px; }
      .roles-panel mat-checkbox { display: block; margin-bottom: 4px; }
      .form-acciones { margin-top: 10px; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
    `,
  ],
})
export class UsuariosFormComponent implements OnInit {
  model: Partial<User> & { password?: string } = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    provider: 'local',
  };
  allRoles: Role[] = [];
  selectedRoles: string[] = [];
  isEdit = false;
  userId = '';
  loading = false;
  saving = false;

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.rolesService.getAll(true).subscribe((roles) => (this.allRoles = roles));
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.isEdit = !!this.userId;
    if (this.isEdit && this.userId) {
      this.usersService.getById(this.userId).subscribe((u) => {
        this.model = {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          username: u.username,
          provider: u.provider,
        };
        this.selectedRoles = (u.roles || [])
          .map((r) => (typeof r === 'string' ? r : (r as any)._id || r.id))
          .filter((x): x is string => !!x);
      });
    }
  }

  toggleRole(r: Role): void {
    if (!r.id) {
      return;
    }
    this.selectedRoles = this.selectedRoles.includes(r.id)
      ? this.selectedRoles.filter((x) => x !== r.id)
      : [...this.selectedRoles, r.id];
  }

  guardar(): void {
    this.saving = true;
    const payload: any = {
      firstName: this.model.firstName,
      lastName: this.model.lastName,
      email: this.model.email,
      username: this.model.username,
    };
    if (!this.isEdit || (this.model.password && this.model.password.trim())) {
      payload.password = this.model.password;
    }

    const onDone = (id: string) => {
      // Siempre sincronizar los roles asignados (edición o creación)
      this.usersService.updateRoles(id, this.selectedRoles).subscribe({
        next: () => this.finish(),
        error: (err) => this.fail(err),
      });
    };

    const op = this.isEdit
      ? this.usersService.update(this.userId, payload)
      : this.usersService.create({ ...payload, provider: 'local' });

    op.subscribe({
      next: (res: any) => {
        const id = this.isEdit ? this.userId : res?.data?.user?.id || res?.data?.id;
        if (!id) {
          this.finish();
        } else {
          onDone(id);
        }
      },
      error: (err) => this.fail(err),
    });
  }

  private finish(): void {
    this.saving = false;
    this.snack.open('Usuario guardado.', 'Cerrar', { duration: 2500 });
    this.router.navigate(['/admin/usuarios']);
  }

  private fail(err: string): void {
    this.saving = false;
    this.snack.open(err, 'Cerrar', { duration: 3000 });
  }
}
