export const DICCIONARIOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/diccionario-list/diccionario-list.component'
      ).then((c) => c.DiccionarioListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/diccionario-form/diccionario-form.component'
      ).then((c) => c.DiccionarioFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/diccionario-form/diccionario-form.component'
      ).then((c) => c.DiccionarioFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/diccionario-detail/diccionario-detail.component'
      ).then((c) => c.DiccionarioDetailComponent),
  },
];
