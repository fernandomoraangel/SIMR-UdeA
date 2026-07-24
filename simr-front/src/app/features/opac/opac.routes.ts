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
  {
    path: 'roles',
    loadComponent: () =>
      import('./presentation/components/opac-roles/opac-roles.component').then(c => c.OpacRolesComponent),
  },
  {
    path: 'instrumentos',
    loadComponent: () =>
      import('./presentation/components/opac-instrumentos/opac-instrumentos.component').then(c => c.OpacInstrumentosComponent),
  },
  {
    path: 'multi',
    loadComponent: () =>
      import('./presentation/components/opac-multi/opac-multi.component').then(c => c.OpacMultiComponent),
  },
  {
    path: 'generos',
    loadComponent: () =>
      import('./presentation/components/opac-generos/opac-generos.component').then(c => c.OpacGenerosComponent),
  },
  { path: '**', redirectTo: 'obras' },
];
