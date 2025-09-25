import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Servicios
import { ArchivosService } from './archivos.service';

// Módulos
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '@shared/shared.module';

// Componentes
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';
import { ArchivoRoutingModule } from './archivos.routes';

@NgModule({
  declarations: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent,
  ],
  exports: [
    ArchivoListaComponent,
    ArchivoSubidaComponent,
    ArchivoVistaComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    SharedModule,
    ArchivoRoutingModule,
  ],
  providers: [ArchivosService],
})
export class ArchivoModule {}
