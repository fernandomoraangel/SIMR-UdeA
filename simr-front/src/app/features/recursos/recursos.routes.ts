export const RECURSOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/recurso-list/recurso-list.component').then(
        (c) => c.RecursoListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/recurso-form/recurso-form.component').then(
        (c) => c.RecursoFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/recurso-form/recurso-form.component').then(
        (c) => c.RecursoFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/recurso-detail/recurso-detail.component').then(
        (c) => c.RecursoDetailComponent
      ),
  },
];
