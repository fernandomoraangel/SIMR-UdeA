export const MATERIAS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/components/materia-list/materia-list.component'
      ).then((c) => c.MateriasListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './presentation/components/materia-form/materia-form.component'
      ).then((c) => c.MateriaFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import(
        './presentation/components/materia-form/materia-form.component'
      ).then((c) => c.MateriaFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/components/materia-detail/materia-detail.component'
      ).then((c) => c.MateriaDetailComponent),
  },
];
