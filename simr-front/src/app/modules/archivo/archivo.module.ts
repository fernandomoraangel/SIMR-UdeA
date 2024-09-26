import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';

// Servicios
import { ArchivoService } from './services/archivo.service';


@NgModule({
  declarations: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent
  ],
  exports: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    ArchivoService
  ]
})
export class ArchivoModule { }
