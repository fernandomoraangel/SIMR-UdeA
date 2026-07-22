export const PROYECTOS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/proyecto-list/proyecto-list.component').then(
        (c) => c.ProyectoListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/proyecto-form/proyecto-form.component').then(
        (c) => c.ProyectoFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/components/proyecto-form/proyecto-form.component').then(
        (c) => c.ProyectoFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/proyecto-detail/proyecto-detail.component').then(
        (c) => c.ProyectoDetailComponent
      ),
  },
];
