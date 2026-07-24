import { Routes } from '@angular/router';

export const OPAC_ROUTES: Routes = [
  {
    path: 'obras',
    loadComponent: () =>
      import('./presentation/components/opac-obras/opac-obras.component').then(c => c.OpacObrasComponent),
  },
  {
    path: 'actores',
    loadComponent: () =>
      import('./presentation/components/opac-actores/opac-actores.component').then(c => c.OpacActoresComponent),
  },
  {
    path: 'fondos',
    loadComponent: () =>
      import('./presentation/components/opac-fondos/opac-fondos.component').then(c => c.OpacFondosComponent),
  },
  { path: '**', redirectTo: 'obras' },
];
