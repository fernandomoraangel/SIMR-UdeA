import { Routes } from '@angular/router';

export const AYUDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./manual/manual.component').then((c) => c.ManualComponent),
  },
  {
    path: 'manual',
    loadComponent: () =>
      import('./manual/manual.component').then((c) => c.ManualComponent),
  },
  {
    path: 'acerca-de',
    loadComponent: () =>
      import('./acerca-de/acerca-de.component').then((c) => c.AcercaDeComponent),
  },
];