import { NgModule } from '@angular/core';

@NgModule({
  providers: [
    // ActorService,
    // InstrumentoService,
    // IdiomaService,
    // ColeccionService
  ],
})
export class ReferenceDataModule {}

// En cada módulo de entidad que necesite referencias
// @NgModule({
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     ReferenceDataModule, // Import para acceder a servicios de referencia
//     ObraRoutingModule
//   ],
//   declarations: [
//     ObraListComponent,
//     ObraFormComponent,
//     ObraDetailComponent,
//     ObraEditComponent
//   ]
// })
// export class ObraModule { }
