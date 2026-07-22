import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Ejemplar, CreateEjemplarRequest, UpdateEjemplarRequest } from '../domain/ejemplar.interface';
import { EjemplaresService } from '../data/ejemplares.service';

interface EjemplaresState {
  ejemplares: Ejemplar[];
  selectedEjemplar: Ejemplar | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: EjemplaresState = {
  ejemplares: [],
  selectedEjemplar: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class EjemplaresStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    ejemplaresCount: computed(() => store.ejemplares().length),
    hasEjemplares: computed(() => store.ejemplares().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(EjemplaresService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((ejemplares) => patchState(store, { ejemplares, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar ejemplares', success: false });
              return of([]);
            })
          )
        )
      )
    ),
    loadById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((ejemplar) => patchState(store, { selectedEjemplar: ejemplar, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar ejemplar', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateEjemplarRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.ejemplares();
              patchState(store, { ejemplares: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear ejemplar' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateEjemplarRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.ejemplares();
              const updatedList = current.map((e) => (e._id === id ? updated : e));
              patchState(store, { ejemplares: updatedList, selectedEjemplar: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar ejemplar', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const current = store.ejemplares();
              patchState(store, { ejemplares: current.filter((e) => e._id !== id), selectedEjemplar: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar ejemplar', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedEjemplar: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
