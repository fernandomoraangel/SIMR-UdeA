import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    console.log('🛡️ AuthGuard: Verificando acceso a', state.url);

    return this.authService.authState$.pipe(
      take(1), // Solo necesitamos el primer valor
      switchMap((authState) => {
        console.log('🛡️ AuthGuard: Estado de auth', {
          isAuthenticated: authState.isAuthenticated,
          user: authState.user?.username,
        });

        if (authState.isAuthenticated) {
          console.log('🛡️ AuthGuard: Acceso permitido');
          return of(true);
        }

        console.log('🛡️ AuthGuard: Redirigiendo a login');
        const urlTree = this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return of(urlTree);
      })
    );
  }
}