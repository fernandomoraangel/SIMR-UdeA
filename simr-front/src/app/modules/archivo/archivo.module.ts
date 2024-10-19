import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { ArchivoListaComponent } from './archivo-lista/archivo-lista.component';
import { ArchivoSubidaComponent } from './archivo-subida/archivo-subida.component';
import { ArchivoVistaComponent } from './archivo-vista/archivo-vista.component';

// Servicios
import { ArchivoService } from './archivo.service';

// Módulos
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Rutas
const routes: Routes = [
  { path: 'files', component: ArchivoListaComponent },
  { path: 'files/upload', component: ArchivoSubidaComponent },
  { path: 'files/preview', component: ArchivoVistaComponent }
];

// Interfaces
export interface FileBasicInfo {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
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
    RouterModule.forChild(routes),
    MatDialogModule,
    MatButtonModule
  ],
  providers: [
    ArchivoService
  ]
})
export class ArchivoModule { }
