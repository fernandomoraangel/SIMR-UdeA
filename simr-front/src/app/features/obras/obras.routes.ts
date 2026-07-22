export const OBRAS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/obras-list/obras-list.component').then(
        (c) => c.ObrasListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/obra-form/obra-form.component').then(
        (c) => c.ObraFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/obra-form/obra-form.component').then(
        (c) => c.ObraFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/obra-detail/obra-detail.component').then(
        (c) => c.ObraDetailComponent
      ),
  },
];
