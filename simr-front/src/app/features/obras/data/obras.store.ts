import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Obra, CreateObraRequest, UpdateObraRequest } from '../models/obra.interface';
import { ObrasService } from './obras.service';

interface ObrasState {
  obras: Obra[];
  selectedObra: Obra | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ObrasState = {
  obras: [],
  selectedObra: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class ObrasStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    obrasCount: computed(() => store.obras().length),
    hasObras: computed(() => store.obras().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(ObrasService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((obras) => patchState(store, { obras, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar obras', success: false });
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
            tap((obra) => patchState(store, { selectedObra: obra, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar obra', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateObraRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.obras();
              patchState(store, { obras: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear obra' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateObraRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.obras();
              const updatedList = current.map((r) => (r._id === id ? updated : r));
              patchState(store, { obras: updatedList, selectedObra: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar obra', success: false });
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
              const current = store.obras();
              patchState(store, { obras: current.filter((r) => r._id !== id), selectedObra: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar obra', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedObra: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
