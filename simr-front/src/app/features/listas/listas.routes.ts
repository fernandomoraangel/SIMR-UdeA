import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';
import { ListasAdminComponent } from './listas-admin/listas-admin.component';

export const LISTAS_ROUTES: Routes = [
  {
    path: '',
    component: ListasAdminComponent,
    canActivate: [AuthGuard],
  },
];
