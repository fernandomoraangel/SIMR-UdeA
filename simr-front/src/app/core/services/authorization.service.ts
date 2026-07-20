import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '@env/environment';

export interface PermissionMap {
  [resource: string]: {
    [action: string]: 'any' | 'own' | undefined;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private permissions: PermissionMap | null = null;
  private userRole: Role | string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ===== Carga de permisos (equivalente a PermissionsService.loadPermissions) =====
  loadPermissions(): Observable<{ permissions: PermissionMap; role: Role | string | null }> {
    return this.http
      .get<{ data: { permissions: PermissionMap; role: Role | string | null } }>(
        `${environment.apiUrl}/permissions`,
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.data),
        tap((data) => {
          this.permissions = data.permissions;
          this.userRole = data.role;
          console.log('[Authorization] Permisos cargados:', this.permissions);
          console.log('[Authorization] Rol del usuario:', this.userRole);
        })
      );
  }

  getPermissions(): PermissionMap | null {
    return this.permissions;
  }

  getUserRole(): Role | string | null {
    return this.userRole;
  }

  // ===== Funciones de verificación de roles (equivalente a Authorization) =====
  private currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  private roleName(role: Role | string): string {
    if (typeof role === 'string') {
      return role;
    }
    return role.name;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some((r) => this.roleName(r) === 'admin');
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some((r) => this.roleName(r) === roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some((rn) => this.hasRole(rn));
  }

  isOnlyRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    const userRoles = user.roles.map((r) => this.roleName(r));
    return (
      userRoles.includes(roleName) &&
      !userRoles.includes('admin') &&
      !userRoles.includes('bibliotecologo') &&
      !userRoles.includes('catalogador') &&
      (roleName === 'investigador' ? !userRoles.includes('catalogador') : true)
    );
  }

  canCreate(_resource?: string): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    if (this.isAdmin()) {
      return true;
    }
    if (this.isOnlyRole('lector')) {
      return false;
    }
    if (this.isOnlyRole('investigador')) {
      return false;
    }
    return this.hasAnyRole(['catalogador', 'bibliotecologo', 'admin']);
  }

  canEdit(resource?: string): boolean {
    return this.canCreate(resource);
  }

  canDelete(resource?: string): boolean {
    return this.canCreate(resource);
  }

  canList(_resource?: string): boolean {
    return this.authService.isAuthenticated();
  }

  // ===== Permisos granulares por recurso/acción (equivalente a hasPermission) =====
  hasPermission(resource: string, action: string): boolean {
    if (!this.permissions || !this.permissions[resource]) {
      return false;
    }
    const value = this.permissions[resource][action];
    return value === 'any';
  }

  hasAnyPermission(resource: string, actions: string[]): boolean {
    return actions.some((a) => this.hasPermission(resource, a));
  }

  // ===== Guards de ruta =====
  requireAuth(): boolean {
    return this.authService.isAuthenticated();
  }

  requirePermission(permission: string, resource?: string): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    switch (permission) {
      case 'create':
        return this.canCreate(resource);
      case 'edit':
        return this.canEdit(resource);
      case 'delete':
        return this.canDelete(resource);
      case 'list':
      case 'read':
        return this.canList(resource);
      case 'admin':
        return this.isAdmin();
      default:
        return false;
    }
  }
}
