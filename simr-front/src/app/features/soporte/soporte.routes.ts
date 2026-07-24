import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const SOPORTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/soporte-list/soporte-list.component').then((c) => c.SoporteListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./presentation/components/soporte-form/soporte-form.component').then((c) => c.SoporteFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/soporte-detail/soporte-detail.component').then((c) => c.SoporteDetailComponent),
    canActivate: [AuthGuard],
  },
];
