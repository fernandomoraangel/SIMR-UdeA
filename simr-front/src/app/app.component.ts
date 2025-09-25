import { Component } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'SIMR1';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.init();
  }
}