import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const NUBE_ARCHIVOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./presentation/components/nube-archivos-list/nube-archivos-list.component').then(
        (m) => m.NubeArchivosListComponent
      ),
  },
];
