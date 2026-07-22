export const SISTEMAS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/sistema-list/sistema-list.component').then(
        (c) => c.SistemaListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/sistema-form/sistema-form.component').then(
        (c) => c.SistemaFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/sistema-form/sistema-form.component').then(
        (c) => c.SistemaFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/sistema-detail/sistema-detail.component').then(
        (c) => c.SistemaDetailComponent
      ),
  },
];
