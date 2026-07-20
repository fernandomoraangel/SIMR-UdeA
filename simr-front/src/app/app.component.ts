import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { AuthorizationService } from '@core/services/authorization.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'SIMR1';

  constructor(
    private authService: AuthService,
    private authorizationService: AuthorizationService
  ) {}

  ngOnInit(): void {
    this.authService.init();
    this.authService.ready$.subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.authorizationService
          .loadPermissions()
          .pipe()
          .subscribe({
            error: (err) =>
              console.error('[App] Error cargando permisos:', err),
          });
      }
    });
  }
}