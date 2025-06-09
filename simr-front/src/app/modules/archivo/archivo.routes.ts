import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';

// Rutas
const routes: Routes = [
  { path: 'files', component: ArchivoListaComponent },
  { path: 'files/upload', component: ArchivoSubidaComponent },
  { path: 'files/preview', component: ArchivoVistaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchivoRoutingModule {}
