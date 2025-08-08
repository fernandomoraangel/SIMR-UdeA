export const IDIOMAS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/idiomas-list/idiomas-list.component'
      ).then((c) => c.IdiomasListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/idioma-form/idioma-form.component'
      ).then((c) => c.IdiomaFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/idioma-form/idioma-form.component'
      ).then((c) => c.IdiomaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/idioma-detail/idioma-detail.component'
      ).then((c) => c.IdiomaDetailComponent),
  },
];
