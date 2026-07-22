export const GENEROS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/genero-list/genero-list.component').then(
        (c) => c.GeneroListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/genero-form/genero-form.component').then(
        (c) => c.GeneroFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/genero-form/genero-form.component').then(
        (c) => c.GeneroFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/genero-detail/genero-detail.component').then(
        (c) => c.GeneroDetailComponent
      ),
  },
];
