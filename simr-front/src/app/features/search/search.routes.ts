import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';
import { SearchComponent } from './search.component';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    component: SearchComponent,
    canActivate: [AuthGuard],
  },
];
