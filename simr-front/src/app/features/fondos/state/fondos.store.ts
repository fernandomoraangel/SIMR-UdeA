import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Fondo, CreateFondoRequest, UpdateFondoRequest } from '../domain/fondo.interface';
import { FondosService } from '../data/fondos.service';

interface FondosState {
  fondos: Fondo[];
  selectedFondo: Fondo | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: FondosState = {
  fondos: [],
  selectedFondo: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class FondosStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    fondosCount: computed(() => store.fondos().length),
    hasFondos: computed(() => store.fondos().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(FondosService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((fondos) => patchState(store, { fondos, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar fondos', success: false });
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
            tap((fondo) => patchState(store, { selectedFondo: fondo, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar fondo', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateFondoRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.fondos();
              patchState(store, { fondos: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear fondo' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateFondoRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.fondos();
              const updatedList = current.map((f) => (f._id === id ? updated : f));
              patchState(store, { fondos: updatedList, selectedFondo: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar fondo', success: false });
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
              const current = store.fondos();
              patchState(store, { fondos: current.filter((f) => f._id !== id), selectedFondo: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar fondo', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedFondo: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
