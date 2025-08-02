import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Servicios
import { ArchivoService } from './archivo.service';

// Módulos
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../../shared/shared.module';

// Componentes
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';
import { ArchivoRoutingModule } from './archivo.routes';

// Interfaces
export interface FileBasicInfo {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
}

export interface FileDeleteInfo {
  fileName: string;
  id: string;
  documentId?: string;
}

export interface FileDocumentInfo {
  id: string;
  name: string;
  documentId: string;
}

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
  providers: [ArchivoService],
})
export class ArchivoModule {}
