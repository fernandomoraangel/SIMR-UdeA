export const INSTRUMENTOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/instrumento-list/instrumento-list.component').then(
        (c) => c.InstrumentosListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/instrumento-form/instrumento-form.component').then(
        (c) => c.InstrumentoFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/instrumento-form/instrumento-form.component').then(
        (c) => c.InstrumentoFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/instrumento-detail/instrumento-detail.component').then(
        (c) => c.InstrumentoDetailComponent
      ),
  },
];
