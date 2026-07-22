import { Routes } from '@angular/router';

export const MAPA_VISUALIZADOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/mapa-visualizador/mapa-visualizador.component').then(
        (c) => c.MapaVisualizadorComponent
      ),
  },
];
