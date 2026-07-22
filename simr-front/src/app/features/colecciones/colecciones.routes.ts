export const COLECCIONES_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/coleccion-list/coleccion-list.component').then(
        (c) => c.ColeccionesListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/coleccion-form/coleccion-form.component').then(
        (c) => c.ColeccionFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/coleccion-form/coleccion-form.component').then(
        (c) => c.ColeccionFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/coleccion-detail/coleccion-detail.component').then(
        (c) => c.ColeccionDetailComponent
      ),
  },
];
