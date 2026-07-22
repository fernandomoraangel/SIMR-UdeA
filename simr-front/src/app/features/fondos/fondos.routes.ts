export const FONDOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/fondo-list/fondo-list.component'
      ).then((c) => c.FondoListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/fondo-form/fondo-form.component'
      ).then((c) => c.FondoFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/fondo-form/fondo-form.component'
      ).then((c) => c.FondoFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/fondo-detail/fondo-detail.component'
      ).then((c) => c.FondoDetailComponent),
  },
];
