// import { Injectable } from "@angular/core";

// @Injectable({
//   providedIn: 'root'
// })
// export class EntityManagerService {
//   private actorService = inject(ActorService);
//   private instrumentoService = inject(InstrumentoService);
//   private idiomaService = inject(IdiomaService);

//   // Métodos para obtener datos de referencia
//   getActores() {
//     return this.actorService.getAll();
//   }

//   getInstrumentos() {
//     return this.instrumentoService.getAll();
//   }

//   getIdiomas() {
//     return this.idiomaService.getAll();
//   }
// }

import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { ReferenceDataService } from '../../shared/reference-data/reference-data.service';

/**
 * Servicio centralizado para manejar interdependencias entre entidades.
 * Facilita el acceso a datos de referencia necesarios para formularios.
 */
@Injectable({
  providedIn: 'root',
})
export class EntityManagerService {
  private referenceDataService = inject(ReferenceDataService);

  // Señales para el estado global de entidades de referencia
  private _referencesLoaded = signal<boolean>(false);
  private _referencesLoading = signal<boolean>(false);

  readonly referencesLoaded = computed(() => this._referencesLoaded());
  readonly referencesLoading = computed(() => this._referencesLoading());

  /**
   * Precarga datos de referencia críticos
   * Llamar en el arranque de la aplicación o módulos principales
   */
  preloadCriticalReferences(): Observable<boolean> {
    this._referencesLoading.set(true);

    return combineLatest([
      this.referenceDataService.getDiccionarios(),
      // Aquí agregarías otros servicios de referencia:
      // this.actorService.findAll(),
      // this.instrumentoService.findAll(),
      // this.idiomaService.findAll()
    ]).pipe(
      map(() => {
        this._referencesLoaded.set(true);
        this._referencesLoading.set(false);
        return true;
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtiene ayuda contextual para cualquier entidad/campo
   */
  getContextualHelp(entityType: string, fieldName: string): any {
    switch (entityType) {
      case 'diccionario':
        return this.referenceDataService.getFieldHelp(entityType, fieldName);

      // Casos para otras entidades:
      // case 'obra':
      //   return this.obraReferenceService.getFieldHelp(fieldName);
      // case 'actor':
      //   return this.actorReferenceService.getFieldHelp(fieldName);

      default:
        console.warn(`Entity type '${entityType}' not found in EntityManager`);
        return null;
    }
  }

  /**
   * Verifica si una entidad tiene dependencias con otras
   */
  getEntityDependencies(entityType: string): string[] {
    const dependencies: Record<string, string[]> = {
      diccionario: [], // Diccionario no depende de otras entidades
      // 'obra': ['actor', 'idioma', 'instrumento'], // Ejemplo de dependencias
      // 'evento': ['obra', 'lugar'], // Otro ejemplo
    };

    return dependencies[entityType] || [];
  }

  /**
   * Invalida caches después de operaciones CRUD
   */
  invalidateEntityCache(entityType: string): void {
    switch (entityType) {
      case 'diccionario':
        this.referenceDataService.invalidateCache();
        break;

      // Casos para otras entidades
      default:
        console.warn(`Cache invalidation not implemented for '${entityType}'`);
    }
  }
}
