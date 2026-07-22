export const GENEROS_NO_MUSICALES_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/genero-no-musical-list/genero-no-musical-list.component').then(
        (c) => c.GeneroNoMusicalListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/genero-no-musical-form/genero-no-musical-form.component').then(
        (c) => c.GeneroNoMusicalFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/genero-no-musical-form/genero-no-musical-form.component').then(
        (c) => c.GeneroNoMusicalFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/genero-no-musical-detail/genero-no-musical-detail.component').then(
        (c) => c.GeneroNoMusicalDetailComponent
      ),
  },
];
