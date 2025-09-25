import { Injectable, signal, computed, inject } from '@angular/core';
// import { toSignal } from '@angular/core/rxjs-interop';
import { DiccionariosService } from '../services/diccionarios.service';
import { Diccionario } from '../models/diccionario.interface';

export interface DiccionarioState {
  diccionarios: Diccionario[];
  currentDiccionario: Diccionario | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  sortProperty: string;
  sortReverse: boolean;
}

@Injectable()
export class DiccionariosStore {
  private diccionarioService = inject(DiccionariosService);

  // Estado con signals
  private state = signal<DiccionarioState>({
    diccionarios: [],
    currentDiccionario: null,
    isLoading: false,
    error: null,
    searchTerm: '',
    sortProperty: 'tabla',
    sortReverse: false,
  });

  // Selectores computados
  readonly diccionarios = computed(() => this.state().diccionarios);
  readonly currentDiccionario = computed(() => this.state().currentDiccionario);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly searchTerm = computed(() => this.state().searchTerm);
  readonly sortProperty = computed(() => this.state().sortProperty);
  readonly sortReverse = computed(() => this.state().sortReverse);

  // Diccionarios filtrados y ordenados
  readonly filteredDiccionarios = computed(() => {
    const diccionarios = this.diccionarios();
    const searchTerm = this.searchTerm().toLowerCase();
    const sortProperty = this.sortProperty();
    const sortReverse = this.sortReverse();

    let filtered = diccionarios;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = diccionarios.filter(
        (d) =>
          d.tabla.toLowerCase().includes(searchTerm) ||
          d.campo.toLowerCase().includes(searchTerm) ||
          d.campoLargo.toLowerCase().includes(searchTerm) ||
          d.definicion.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar ordenamiento
    if (sortProperty) {
      filtered.sort((a, b) => {
        const aVal = a[sortProperty as keyof Diccionario] as string;
        const bVal = b[sortProperty as keyof Diccionario] as string;
        const comparison = aVal.localeCompare(bVal);
        return sortReverse ? -comparison : comparison;
      });
    }

    return filtered;
  });

  // Acciones
  setLoading(isLoading: boolean): void {
    this.state.update((state) => ({ ...state, isLoading }));
  }

   setDiccionarios(diccionarios: Diccionario[]) {
    this.state.update(state => ({ ...state, diccionarios, error: null }));
  }

  setError(error: string | null): void {
    this.state.update((state) => ({ ...state, error }));
  }

  setSearchTerm(searchTerm: string): void {
    this.state.update((state) => ({ ...state, searchTerm }));
  }

  setSorting(property: string): void {
    this.state.update((state) => ({
      ...state,
      sortProperty: property,
      sortReverse: state.sortProperty === property ? !state.sortReverse : false,
    }));
  }

  loadDiccionarios(): void {
    this.setLoading(true);
    this.setError(null);

    this.diccionarioService.findAll().subscribe({
      next: (diccionarios) => {
        this.state.update((state) => ({
          ...state,
          diccionarios,
          isLoading: false,
        }));
      },
      error: (error) => {
        this.setError('Error al cargar diccionarios');
        this.setLoading(false);
      },
    });
  }

  loadDiccionario(id: string): void {
    this.setLoading(true);
    this.setError(null);

    this.diccionarioService.findOne(id).subscribe({
      next: (diccionario) => {
        this.state.update((state) => ({
          ...state,
          currentDiccionario: diccionario,
          isLoading: false,
        }));
      },
      error: (error) => {
        this.setError('Error al cargar diccionario');
        this.setLoading(false);
      },
    });
  }

  // Computed para diccionarios filtrados y ordenados
  filteredAndSortedDiccionarios = computed(() => {
    let result = [...this.diccionarios()];

    // Filtrar por término de búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(
        (d) =>
          d.tabla.toLowerCase().includes(search) ||
          d.campo.toLowerCase().includes(search) ||
          d.definicion.toLowerCase().includes(search) ||
          (d.campoLargo && d.campoLargo.toLowerCase().includes(search))
      );
    }

    // Ordenar
    const prop = this.sortProperty();
    const reverse = this.sortReverse();

    result.sort((a: any, b: any) => {
      if (a[prop] < b[prop]) return reverse ? 1 : -1;
      if (a[prop] > b[prop]) return reverse ? -1 : 1;
      return 0;
    });

    return result;
  });

  clearError() {
    this.state.update((state) => ({ ...state, error: null }));
  }
}
