export const DICCIONARIOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./components/diccionario-list/diccionario-list.component').then(
        (c) => c.DiccionarioListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/diccionario-form/diccionario-form.component').then(
        (c) => c.DiccionarioFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/diccionario-form/diccionario-form.component').then(
        (c) => c.DiccionarioFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './components/diccionario-detail/diccionario-detail.component'
      ).then((c) => c.DiccionarioDetailComponent),
  },
];
