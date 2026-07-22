export const ESTADISTICAS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/estadisticas-dashboard/estadisticas-dashboard.component').then(
        (c) => c.EstadisticasDashboardComponent
      ),
  },
];
