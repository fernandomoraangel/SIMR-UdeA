import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Actor } from '../models/actor.interface';
import { ActoresService } from './actores.service';

interface ActoresState {
  actores: Actor[];
  selectedActor: Actor | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ActoresState = {
  actores: [],
  selectedActor: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class ActoresStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    actoresCount: computed(() => store.actores().length),
    hasActores: computed(() => store.actores().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(ActoresService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((actores) => patchState(store, { actores, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar actores', success: false });
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
            tap((actor) => patchState(store, { selectedActor: actor, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar actor', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<Partial<Actor>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              patchState(store, { actores: [newItem, ...store.actores()], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear actor' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: Partial<Actor> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const updatedList = store.actores().map((a) => (a._id === id ? updated : a));
              patchState(store, { actores: updatedList, selectedActor: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar actor', success: false });
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
              patchState(store, { actores: store.actores().filter((a) => a._id !== id), selectedActor: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar actor', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedActor: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
