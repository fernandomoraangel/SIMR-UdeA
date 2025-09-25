import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Componentes
import { HomeComponent } from './features/home/home.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { AuthGuard } from './core/auth/auth.guard';
import { ListaTareasComponent } from '@features/__pruebas__/lista-tareas.component';
// import { CustomPreloadingStrategy } from './core/services/preloading-strategy.service';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  // { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'listado-tareas', component: ListaTareasComponent },

  // Lazy loaded routes
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'diccionarios',
  //   loadChildren: () =>
  //     import('./features/diccionarios/diccionarios.routes').then(
  //       (r) => r.DICCIONARIOS_ROUTES
  //     ),
  // },
  // {
  //   path: 'diccionarios',
  //   loadChildren: () => import('./features/diccionarios/diccionario.module').then(m => m.DiccionariosModule)
  // },
  {
    path: 'diccionarios',
    loadChildren: () =>
      import('./features/diccionarios/diccionarios.routes').then(
        (r) => r.DICCIONARIOS_ROUTES
      ),
  },
  {
    path: 'idiomas',
    loadChildren: () =>
      import('./features/idiomas/idiomas.routes').then((r) => r.IDIOMAS_ROUTES),
  },
  {
    path: 'files',
    loadChildren: () =>
      import('./features/archivos/archivos.module').then(
        (m) => m.ArchivoModule
      ),
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
      // preloadingStrategy: CustomPreloadingStrategy, // precarga personalizada
    }),
  ],
  exports: [RouterModule],
  // providers: [CustomPreloadingStrategy] // Para que Angular inyecte la estrategia de precarga personalizada
})
export class AppRoutingModule {}
