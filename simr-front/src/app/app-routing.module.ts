import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
// import { ActorListComponent } from './actor-list/actor-list.component';
// import { ActorDetailComponent } from './actor-detail/actor-detail.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';


const routes: Routes = [
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', component: HomeComponent },
  // { path: 'actores', loadChildren: () => import('./modules/actor/actor.module').then(m => m.ActorModule) },
  // { path: 'home', component: HomeComponent },
  // { path: 'actores', component: ActoresComponent },
  // { path: 'actores', component: ActorListComponent },
  // { path: 'actores/:id', component: ActorDetailComponent },
  // { path: '**', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
