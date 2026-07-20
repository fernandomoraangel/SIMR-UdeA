import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authorizationService: AuthorizationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = (route.data['roles'] as string[]) ?? [];

    if (!this.authorizationService.requireAuth()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = this.authorizationService.hasAnyRole(requiredRoles);

    if (!hasRole) {
      this.router.navigate(['/no-implementado/admin-usuarios']);
      return false;
    }

    return true;
  }
}
