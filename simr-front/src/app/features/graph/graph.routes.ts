export const GRAPH_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('./graph.component').then((c) => c.GraphComponent),
  },
];
