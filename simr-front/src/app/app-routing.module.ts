import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Componentes
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Lazy loaded routes
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'diccionarios',
    loadChildren: () =>
      import('./features/diccionario/diccionario.routes').then(
        (r) => r.DICCIONARIOS_ROUTES
      ),
  },
  // {
  //   path: 'diccionarios',
  //   loadChildren: () => import('./features/diccionarios/diccionario.module').then(m => m.DiccionariosModule)
  // },
  {
    path: 'idiomas',
    loadChildren: () =>
      import('./features/idioma/idioma.routes').then((r) => r.IDIOMAS_ROUTES),
  },
  {
    path: 'files',
    loadChildren: () =>
      import('./modules/archivo/archivo.module').then((m) => m.ArchivoModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'prueba',
    loadChildren: () =>
      import('./modules/prueba/prueba.module').then((m) => m.PruebaModule),
    canActivate: [AuthGuard],
  },

  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Optimizaciones adicionales
      enableTracing: false, // solo para desarrollo
      preloadingStrategy: PreloadAllModules, // precarga módulos después de la carga inicial
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
