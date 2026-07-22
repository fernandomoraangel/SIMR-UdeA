import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Componentes
import { BienvenidaComponent } from './features/bienvenida/bienvenida.component';
import { NoImplementadoComponent } from './shared/no-implementado/no-implementado.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { AuthRouteComponent } from './features/auth/auth-route.component';
import { RoleGuard } from './core/guards/role.guard';
import { AuthGuard } from './core/auth/auth.guard';
import { ListaTareasComponent } from '@features/__pruebas__/lista-tareas.component';
// import { CustomPreloadingStrategy } from './core/services/preloading-strategy.service';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  // Ruta por defecto: muestra el shell con el bloque de bienvenida legacy
  // (el shell ya renderiza sello.png + enlaces cuando no hay sesión).
  { path: '', component: BienvenidaComponent },
  { path: 'login', component: AuthRouteComponent },
  { path: 'signup', component: AuthRouteComponent },
  { path: 'listado-tareas', component: ListaTareasComponent },
  // Página temporal para módulos aún no migrados desde AngularJS
  { path: 'no-implementado/:modulo', component: NoImplementadoComponent },

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
    path: 'materias',
    loadChildren: () =>
      import('./features/materias/materias.routes').then((r) => r.MATERIAS_ROUTES),
  },
  {
    path: 'medios',
    loadChildren: () =>
      import('./features/medios/medios.routes').then((r) => r.MEDIOS_ROUTES),
  },
  {
    path: 'sistemas',
    loadChildren: () =>
      import('./features/sistemas/sistemas.routes').then((r) => r.SISTEMAS_ROUTES),
  },
  {
    path: 'fondos',
    loadChildren: () =>
      import('./features/fondos/fondos.routes').then((r) => r.FONDOS_ROUTES),
  },
  {
    path: 'instrumentos',
    loadChildren: () =>
      import('./features/instrumentos/instrumentos.routes').then((r) => r.INSTRUMENTOS_ROUTES),
  },
  {
    path: 'generos',
    loadChildren: () =>
      import('./features/generos/generos.routes').then((r) => r.GENEROS_ROUTES),
  },
  {
    path: 'colecciones',
    loadChildren: () =>
      import('./features/colecciones/colecciones.routes').then((r) => r.COLECCIONES_ROUTES),
  },
  {
    path: 'generos-no-musicales',
    loadChildren: () =>
      import('./features/generos-no-musicales/generos-no-musicales.routes').then((r) => r.GENEROS_NO_MUSICALES_ROUTES),
  },
  {
    path: 'idiomas',
    loadChildren: () =>
      import('./features/idiomas/idiomas.routes').then((r) => r.IDIOMAS_ROUTES),
  },
  {
    path: 'ejemplares',
    loadChildren: () =>
      import('./features/ejemplares/ejemplares.routes').then((r) => r.EJEMPLARES_ROUTES),
  },
  {
    path: 'proyectos',
    loadChildren: () =>
      import('./features/proyectos/proyectos.routes').then((r) => r.PROYECTOS_ROUTES),
  },
  {
    path: 'obras',
    loadChildren: () =>
      import('./features/obras/obras.routes').then((r) => r.OBRAS_ROUTES),
  },
  {
    path: 'actores',
    loadChildren: () =>
      import('./features/actores/actores.routes').then((r) => r.ACTORES_ROUTES),
  },
  {
    path: 'recursos',
    loadChildren: () =>
      import('./features/recursos/recursos.routes').then((r) => r.RECURSOS_ROUTES),
  },
  {
    path: 'listas',
    loadChildren: () =>
      import('./features/listas/listas.routes').then((r) => r.LISTAS_ROUTES),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./features/search/search.routes').then((r) => r.SEARCH_ROUTES),
  },
  {
    path: 'estadisticas',
    loadChildren: () =>
      import('./features/estadisticas/estadisticas.routes').then((r) => r.ESTADISTICAS_ROUTES),
  },
  {
    path: 'graph',
    loadChildren: () =>
      import('./features/graph/graph.routes').then((r) => r.GRAPH_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((r) => r.ADMIN_ROUTES),
  },
  {
    path: 'files',
    loadChildren: () =>
      import('./features/archivos/archivos.module').then(
        (m) => m.ArchivoModule
      ),
    // canActivate: [AuthGuard], // Temporalmente comentado para debug
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
