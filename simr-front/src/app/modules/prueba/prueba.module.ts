import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PruebaComponent } from './components/prueba.component';
// import { PruebaRoutingModule } from './prueba-routing.module';
import { RouterModule, Routes } from '@angular/router';

import { ActorCreateComponent } from '../actor/components/actor-create/actor-create.component';
import { DirectivaPruebaDirective } from './directives/directiva-prueba.directive';
import { AngularJSComponentDirective } from './directives/angular-jscomponent.directive';

const routes: Routes = [
  { path: 'prueba', component: PruebaComponent },
  { path: 'prueba/detail/otra-ruta', component: ActorCreateComponent }
];

@NgModule({
  declarations: [
    PruebaComponent,
    DirectivaPruebaDirective,
    AngularJSComponentDirective,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  providers: []
})
export class PruebaModule { }
