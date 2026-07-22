export const MEDIOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/medio-list/medio-list.component'
      ).then((c) => c.MediosListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/medio-form/medio-form.component'
      ).then((c) => c.MedioFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/medio-form/medio-form.component'
      ).then((c) => c.MedioFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/medio-detail/medio-detail.component'
      ).then((c) => c.MedioDetailComponent),
  },
];
