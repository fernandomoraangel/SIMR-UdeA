import { Injectable, signal, computed, inject } from '@angular/core';
import { DiccionariosService } from '../../features/diccionarios/services/diccionarios.service';
import { Diccionario } from '../../features/diccionarios/models/diccionario.interface';
import { Observable, BehaviorSubject, shareReplay } from 'rxjs';

/**
 * Servicio centralizado para manejar datos de referencia que se comparten
 * entre múltiples módulos. Implementa cache inteligente con Signals.
 */
@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private diccionariosService = inject(DiccionariosService);

  // Cache de datos de referencia con Signals
  private _diccionarios = signal<Diccionario[]>([]);
  private _isLoading = signal<boolean>(false);
  private _lastUpdated = signal<Date | null>(null);

  // Cache TTL (Time to Live) en milisegundos - 30 minutos
  private readonly CACHE_TTL = 30 * 60 * 1000;

  // Getters públicos
  readonly diccionarios = computed(() => this._diccionarios());
  readonly isLoading = computed(() => this._isLoading());
  readonly lastUpdated = computed(() => this._lastUpdated());

  // Observable para suscripciones reactivas
  private diccionarios$ = new BehaviorSubject<Diccionario[]>([]);

  /**
   * Obtiene los diccionarios desde cache o servidor según necesidad
   */
  getDiccionarios(): Observable<Diccionario[]> {
    if (this.shouldRefreshCache()) {
      this.refreshDiccionarios();
    }

    return this.diccionarios$.pipe(shareReplay(1));
  }

  /**
   * Fuerza la actualización del cache de diccionarios
   */
  refreshDiccionarios(): void {
    this._isLoading.set(true);

    this.diccionariosService.findAll().subscribe({
      next: (diccionarios) => {
        this._diccionarios.set(diccionarios);
        this._lastUpdated.set(new Date());
        this._isLoading.set(false);
        this.diccionarios$.next(diccionarios);
      },
      error: (error) => {
        this._isLoading.set(false);
        console.error('Error refreshing diccionarios cache:', error);
      },
    });
  }

  /**
   * Obtiene ayuda contextual para un campo específico
   */
  getFieldHelp(tabla: string, campo: string): Diccionario | null {
    const diccionarios = this._diccionarios();
    return (
      diccionarios.find((d) => d.tabla === tabla && d.campo === campo) || null
    );
  }

  /**
   * Verifica si el cache necesita actualizarse
   */
  private shouldRefreshCache(): boolean {
    const lastUpdated = this._lastUpdated();
    if (!lastUpdated || this._diccionarios().length === 0) {
      return true;
    }

    const now = new Date().getTime();
    const lastUpdateTime = lastUpdated.getTime();
    return now - lastUpdateTime > this.CACHE_TTL;
  }

  /**
   * Invalida el cache (útil después de operaciones CRUD)
   */
  invalidateCache(): void {
    this._lastUpdated.set(null);
  }
}
