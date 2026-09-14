import { Routes } from '@angular/router';

export const SEGURIDAD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./seguridad.component').then((c) => c.SeguridadComponent),
  },
];