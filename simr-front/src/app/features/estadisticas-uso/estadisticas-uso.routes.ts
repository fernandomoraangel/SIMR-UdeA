export const ESTADISTICAS_USO_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/estadisticas-uso-dashboard/estadisticas-uso-dashboard.component').then(
        (c) => c.EstadisticasUsoDashboardComponent
      ),
  },
];