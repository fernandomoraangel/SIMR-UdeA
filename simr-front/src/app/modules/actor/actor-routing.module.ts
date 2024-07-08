import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActorCreateComponent } from './components/actor-create/actor-create.component';
import { ActorDetailComponent } from './components/actor-detail/actor-detail.component';
import { ActorEditComponent } from './components/actor-edit/actor-edit.component';
import { ActorListComponent } from './components/actor-list/actor-list.component';

const routes: Routes = [
  { path: 'actores', component: ActorListComponent },
  { path: 'actores/create', component: ActorCreateComponent },
  { path: 'actores/:id', component: ActorDetailComponent },
  { path: 'actores/edit/:id', component: ActorEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActorRoutingModule { }
