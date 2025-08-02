import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Solo los módulos de Material que necesita el dashboard
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
// Agrega otros módulos de Material según necesites

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

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
