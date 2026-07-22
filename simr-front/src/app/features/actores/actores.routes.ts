export const ACTORES_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/actores-list/actores-list.component').then(
        (c) => c.ActoresListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/components/actor-form/actor-form.component').then(
        (c) => c.ActorFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/components/actor-detail/actor-detail.component').then(
        (c) => c.ActorDetailComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./presentation/components/actor-form/actor-form.component').then(
        (c) => c.ActorFormComponent
      ),
  },
];
