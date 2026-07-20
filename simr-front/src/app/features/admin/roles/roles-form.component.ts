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
import { MatTableModule } from '@angular/material/table';

import { RolesService, PermissionShape } from './roles.service';
import { Role } from '@core/models/user.model';

const ACCIONES = ['create', 'read', 'update', 'delete', 'list'];
type Scope = 'own' | 'any' | null;

@Component({
  selector: 'app-roles-form',
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
    MatTableModule,
  ],
  template: `
    <div class="admin-page">
      <header class="admin-head">
        <h1 class="admin-title">{{ isEdit ? 'Editar' : 'Crear' }} rol</h1>
        <button mat-button routerLink="/admin/roles"><mat-icon>arrow_back</mat-icon> Volver</button>
      </header>

      <mat-card appearance="outlined" *ngIf="!loading">
        <form (ngSubmit)="guardar()" class="form-grid">
          <div class="info-basica">
            <mat-form-field appearance="outline">
              <mat-label>Nombre (código)</mat-label>
              <input matInput [(ngModel)]="model.name" name="name" required [disabled]="isSystem" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nombre visualización</mat-label>
              <input matInput [(ngModel)]="model.displayName" name="displayName" required />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Prioridad</mat-label>
              <input matInput type="number" [(ngModel)]="model.priority" name="priority" required [disabled]="isSystem" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Descripción</mat-label>
            <textarea matInput rows="2" [(ngModel)]="model.description" name="description"></textarea>
          </mat-form-field>

          <h3>Herencia de roles</h3>
          <div class="herencia">
            <mat-checkbox *ngFor="let r of allRoles" [checked]="selectedInherits.includes(r.id!)"
              (change)="toggleInherit(r.id!)" [disabled]="r.id === roleId">
              {{ r.displayName || r.name }}
            </mat-checkbox>
          </div>

          <h3>Permisos directos</h3>
          <table mat-table [dataSource]="resources" class="perm-table">
            <ng-container matColumnDef="recurso">
              <th mat-header-cell *matHeaderCellDef>Recurso</th>
              <td mat-cell *matCellDef="let res">{{ res }}</td>
            </ng-container>
            <ng-container *ngFor="let acc of acciones" [matColumnDef]="acc">
              <th mat-header-cell *matHeaderCellDef>{{ acc }}</th>
              <td mat-cell *matCellDef="let res">
                <button type="button" class="scope-btn" [class.active]="getScope(res, acc) === 'own'"
                  (click)="setScope(res, acc, 'own')">own</button>
                <button type="button" class="scope-btn" [class.active]="getScope(res, acc) === 'any'"
                  (click)="setScope(res, acc, 'any')">any</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnasPerm"></tr>
            <tr mat-row *matRowDef="let row; columns: columnasPerm"></tr>
          </table>

          <div class="form-acciones">
            <button mat-flat-button color="primary" type="submit" [disabled]="saving">Guardar rol</button>
          </div>
        </form>
      </mat-card>
      <div *ngIf="loading" class="admin-loading"><mat-spinner diameter="34"></mat-spinner></div>
    </div>
  `,
  styles: [
    `
      .admin-page { max-width: 900px; margin: 0 auto; padding: 28px 24px 48px; }
      .admin-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
      .admin-title { font-family: var(--simr-display); color: var(--simr-tinta); font-size: 1.7rem; margin: 0; }
      .form-grid { padding: 8px; }
      .info-basica { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
      .full { width: 100%; }
      .herencia { margin: 8px 0 18px; }
      .herencia mat-checkbox { display: inline-block; margin-right: 14px; }
      h3 { font-family: var(--simr-body); color: var(--simr-tinta); margin: 16px 0 8px; }
      .perm-table { width: 100%; background: var(--simr-hueso); }
      .scope-btn { font-family: var(--simr-mono); font-size: 0.72rem; border: 1px solid var(--simr-cobre); background: #fff; color: var(--simr-tinta); border-radius: 6px; padding: 2px 8px; margin-right: 4px; cursor: pointer; }
      .scope-btn.active { background: var(--simr-cobre); color: #fff; }
      .form-acciones { margin-top: 16px; }
      .admin-loading { display: flex; justify-content: center; padding: 40px; }
      @media (max-width: 700px) { .info-basica { grid-template-columns: 1fr; } }
    `,
  ],
})
export class RolesFormComponent implements OnInit {
  acciones = ACCIONES;
  resources: string[] = [];
  allRoles: Role[] = [];
  model: Partial<Role> = { name: '', displayName: '', description: '', priority: 0 };
  permisos: Record<string, Record<string, Scope>> = {};
  selectedInherits: string[] = [];
  isEdit = false;
  isSystem = false;
  roleId = '';
  loading = false;
  saving = false;

  constructor(
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  get columnasPerm(): string[] {
    return ['recurso', ...this.acciones];
  }

  ngOnInit(): void {
    this.rolesService.getResources().subscribe((res) => (this.resources = res));
    this.rolesService.getAll(true).subscribe((roles) => (this.allRoles = roles));
    this.roleId = this.route.snapshot.paramMap.get('roleId') || '';
    this.isEdit = !!this.roleId;
    if (this.isEdit && this.roleId) {
      this.rolesService.getById(this.roleId).subscribe((r: any) => {
        this.model = {
          name: r.name,
          displayName: r.displayName,
          description: r.description,
          priority: r.priority,
        };
        this.isSystem = !!r.isSystem;
        if (Array.isArray(r.inheritsFrom)) {
          this.selectedInherits = r.inheritsFrom
            .map((x: any) => (typeof x === 'string' ? x : x.id))
            .filter(Boolean);
        }
        this.loadPermisos(r.permissions);
      });
    }
  }

  private loadPermisos(p?: PermissionShape): void {
    this.permisos = {};
    this.resources.forEach((res) => {
      this.permisos[res] = {};
      this.acciones.forEach((acc) => {
        const scope = p?.[res]?.[acc];
        this.permisos[res][acc] = scope ? (scope[0] as Scope) : null;
      });
    });
  }

  getScope(res: string, acc: string): Scope {
    return this.permisos[res]?.[acc] ?? null;
  }

  setScope(res: string, acc: string, scope: 'own' | 'any'): void {
    if (!this.permisos[res]) {
      this.permisos[res] = {};
    }
    this.permisos[res][acc] = this.permisos[res][acc] === scope ? null : scope;
  }

  toggleInherit(id: string): void {
    this.selectedInherits = this.selectedInherits.includes(id)
      ? this.selectedInherits.filter((x) => x !== id)
      : [...this.selectedInherits, id];
  }

  private buildPermissions(): { resource: string; actions: Record<string, 'any' | 'own'> }[] {
    const out: { resource: string; actions: Record<string, 'any' | 'own'> }[] = [];
    Object.keys(this.permisos).forEach((res) => {
      const actions: Record<string, 'any' | 'own'> = {};
      this.acciones.forEach((acc) => {
        const s = this.permisos[res][acc];
        if (s) {
          actions[acc] = s;
        }
      });
      if (Object.keys(actions).length) {
        out.push({ resource: res, actions });
      }
    });
    return out;
  }

  guardar(): void {
    this.saving = true;
    const payload: any = {
      name: this.model.name,
      displayName: this.model.displayName,
      description: this.model.description,
      priority: Number(this.model.priority) || 0,
      inheritsFrom: this.selectedInherits,
      permissions: this.buildPermissions(),
    };
    const op = this.isEdit
      ? this.rolesService.update(this.roleId, payload)
      : this.rolesService.create(payload);
    op.subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Rol guardado.', 'Cerrar', { duration: 2500 });
        this.router.navigate(['/admin/roles']);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err, 'Cerrar', { duration: 3000 });
      },
    });
  }
}
