import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return false; // Temporarily returning false to prevent access
    
    // const requiredRoles = route.data['roles'] as string[];

    // if (!requiredRoles || requiredRoles.length === 0) {
    //   return true;
    // }

    // if (!this.authService.isAuthenticated) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }

    // const hasRole = this.authService.hasAnyRole(requiredRoles);

    // if (!hasRole) {
    //   this.router.navigate(['/unauthorized']);
    //   return false;
    // }

    // return true;
  }
}
