import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';

// Servicios
import { ArchivoService } from './archivo.service';

// Rutas
const routes: Routes = [
  { path: 'files', component: ArchivoListaComponent },
  { path: 'files/upload', component: ArchivoSubidaComponent }
];

// Interfaces
export interface FileBasicInfo {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
}


@NgModule({
  declarations: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent
  ],
  exports: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent,
    RouterModule
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ArchivoService
  ]
})
export class ArchivoModule { }
