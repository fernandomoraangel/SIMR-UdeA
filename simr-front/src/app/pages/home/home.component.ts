import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {  

  // constructor(private authService: AuthService, private router: Router) {}
   constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada');
        // Redirigir al login si deseas
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }
  
}
