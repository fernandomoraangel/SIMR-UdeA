export const EJEMPLARES_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/ejemplar-list/ejemplar-list.component'
      ).then((c) => c.EjemplarListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/ejemplar-form/ejemplar-form.component'
      ).then((c) => c.EjemplarFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/ejemplar-form/ejemplar-form.component'
      ).then((c) => c.EjemplarFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/ejemplar-detail/ejemplar-detail.component'
      ).then((c) => c.EjemplarDetailComponent),
  },
];
