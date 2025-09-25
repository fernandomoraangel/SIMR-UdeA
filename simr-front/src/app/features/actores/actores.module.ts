import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActorCreateComponent } from './components/actor-create/actor-create.component';
import { ActorDetailComponent } from './components/actor-detail/actor-detail.component';
import { ActorEditComponent } from './components/actor-edit/actor-edit.component';
import { ActorListComponent } from './components/actor-list/actor-list.component';

import { ActorRoutingModule } from './actores-routing.module';
import { ActoresService } from './services/actores.service';
// import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ActorCreateComponent,
    ActorDetailComponent,
    ActorEditComponent,
    ActorListComponent,
  ],
  imports: [CommonModule, ActorRoutingModule],
  providers: [ActoresService],
})
export class ActorModule {}
