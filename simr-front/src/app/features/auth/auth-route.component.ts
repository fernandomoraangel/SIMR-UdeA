import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDialogService } from '@core/services/auth-dialog.service';

@Component({
  selector: 'app-auth-route',
  template: '',
  standalone: false,
})
export class AuthRouteComponent implements OnInit {
  constructor(
    private authDialogService: AuthDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const mode = this.router.url.includes('signup') ? 'signup' : 'login';
    this.authDialogService.open(mode);
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
