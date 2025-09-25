import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Solo los módulos de Material que necesita el dashboard
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
// Agrega otros módulos de Material según necesites

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    // children: [
    //   {
    //     path: 'actores',
    //     loadChildren: () =>
    //       import('../../modules/actor/actor.module').then((m) => m.ActorModule),
    //   },
    //   {
    //     path: 'idiomas',
    //     loadChildren: () =>
    //       import('../../features/idiomas/idiomas.routes').then(
    //         (r) => r.IDIOMAS_ROUTES
    //       ),
    //   },
    // ],
  },
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    // Solo los módulos que necesitas para el dashboard
  ],
})
export class DashboardModule {}
