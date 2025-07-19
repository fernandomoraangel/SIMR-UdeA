import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🛡️ AuthGuard: Verificando acceso a', state.url);
    
    // Esperar a que el servicio esté listo y luego verificar autenticación
    return this.authService.ready$.pipe(
      take(1), // Solo tomar el primer valor cuando esté listo
      map(authState => {
        console.log('🛡️ AuthGuard: Estado de auth', {
          isAuthenticated: authState.isAuthenticated,
          user: authState.user?.username
        });
        
        if (authState.isAuthenticated) {
          return true;
        }

        // Redirigir al login si no está autenticado
        console.log('🛡️ AuthGuard: Redirigiendo a login');
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      })
    );
  }
}