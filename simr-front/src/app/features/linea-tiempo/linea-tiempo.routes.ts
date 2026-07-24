import { Routes } from '@angular/router';

export const LINEA_TIEMPO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/components/linea-tiempo/linea-tiempo.component').then(
        (c) => c.LineaTiempoComponent
      ),
  },
];
