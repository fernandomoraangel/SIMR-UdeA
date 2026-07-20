import { Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UsuariosListaComponent } from './users/usuarios-lista.component';
import { UsuariosFormComponent } from './users/usuarios-form.component';
import { RolesListaComponent } from './roles/roles-lista.component';
import { RolesFormComponent } from './roles/roles-form.component';
import { AuditoriaListaComponent } from './auditoria/auditoria-lista.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'usuarios',
    component: UsuariosListaComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'usuarios/crear',
    component: UsuariosFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'usuarios/:userId/editar',
    component: UsuariosFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'roles',
    component: RolesListaComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'roles/crear',
    component: RolesFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'roles/:roleId/editar',
    component: RolesFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'auditoria',
    component: AuditoriaListaComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];
