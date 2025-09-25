// export const DICCIONARIOS_ROUTES = [
//   {
//     path: '',
//     loadComponent: () =>
//       import('./components/diccionario-list/diccionario-list.component').then(
//         (c) => c.DiccionarioListComponent
//       ),
//   },
//   {
//     path: 'create',
//     loadComponent: () =>
//       import('./components/diccionario-form/diccionario-form.component').then(
//         (c) => c.DiccionarioFormComponent
//       ),
//   },
//   {
//     path: 'edit/:id',
//     loadComponent: () =>
//       import('./components/diccionario-form/diccionario-form.component').then(
//         (c) => c.DiccionarioFormComponent
//       ),
//   },
//   {
//     path: ':id',
//     loadComponent: () =>
//       import(
//         './components/diccionario-detail/diccionario-detail.component'
//       ).then((c) => c.DiccionarioDetailComponent),
//   },
// ];

import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';

export const DICCIONARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './components/diccionario-list/diccionario-list.component'
          ).then((c) => c.DiccionarioListComponent),
        title: 'Diccionario de Datos',
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './components/diccionario-form/diccionario-form.component'
          ).then((c) => c.DiccionarioFormComponent),
        title: 'Crear Campo - Diccionario',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './components/diccionario-detail/diccionario-detail.component'
          ).then((c) => c.DiccionarioDetailComponent),
        title: 'Detalle Campo - Diccionario',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            './components/diccionario-form/diccionario-form.component'
          ).then((c) => c.DiccionarioFormComponent),
        title: 'Editar Campo - Diccionario',
      },
    ],
  },
];
