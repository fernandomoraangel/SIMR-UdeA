import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Sistema, CreateSistemaRequest, UpdateSistemaRequest } from '../domain/sistema.model';
import { SistemasService } from '../data/sistemas.service';

interface SistemasState {
  sistemas: Sistema[];
  selectedSistema: Sistema | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SistemasState = {
  sistemas: [],
  selectedSistema: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class SistemasStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    sistemasCount: computed(() => store.sistemas().length),
    hasSistemas: computed(() => store.sistemas().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(SistemasService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((sistemas) => patchState(store, { sistemas, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar sistemas', success: false });
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
            tap((sistema) => patchState(store, { selectedSistema: sistema, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar sistema', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateSistemaRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.sistemas();
              patchState(store, { sistemas: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear sistema' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateSistemaRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.sistemas();
              const updatedList = current.map((s) => (s._id === id ? updated : s));
              patchState(store, { sistemas: updatedList, selectedSistema: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar sistema', success: false });
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
              const current = store.sistemas();
              patchState(store, { sistemas: current.filter((s) => s._id !== id), selectedSistema: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar sistema', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedSistema: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
