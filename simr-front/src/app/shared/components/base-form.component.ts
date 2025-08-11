import { inject, OnInit, Directive } from '@angular/core';
import { EntityManagerService } from 'app/core/services/entity-manager.service';

@Directive()
export abstract class BaseFormComponent implements OnInit {
  protected entityManager = inject(EntityManagerService);

  // Datos de referencia comunes
  //   actores$ = this.entityManager.getActores();
  //   instrumentos$ = this.entityManager.getInstrumentos();
  //   idiomas$ = this.entityManager.getIdiomas();

  ngOnInit() {
    this.loadReferenceData();
  }

  protected abstract loadReferenceData(): void;
}

// // obra-form.component.ts
// export class ObraFormComponent extends BaseFormComponent {
//   protected loadReferenceData(): void {
//     // Cargar datos específicos adicionales si es necesario
//   }
// }
