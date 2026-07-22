import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { GeneroNoMusical, CreateGeneroNoMusicalRequest, UpdateGeneroNoMusicalRequest } from '../domain/genero-no-musical.interface';
import { GenerosNoMusicalesService } from '../data/generos-no-musicales.service';

interface GenerosNoMusicalesState {
  generos: GeneroNoMusical[];
  selectedGenero: GeneroNoMusical | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: GenerosNoMusicalesState = {
  generos: [],
  selectedGenero: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class GenerosNoMusicalesStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    generosCount: computed(() => store.generos().length),
    hasGeneros: computed(() => store.generos().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(GenerosNoMusicalesService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((generos) => patchState(store, { generos, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar géneros no musicales', success: false });
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
            tap((genero) => patchState(store, { selectedGenero: genero, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar género no musical', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateGeneroNoMusicalRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.generos();
              patchState(store, { generos: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear género no musical' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateGeneroNoMusicalRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.generos();
              const updatedList = current.map((g) => (g._id === id ? updated : g));
              patchState(store, { generos: updatedList, selectedGenero: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar género no musical', success: false });
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
              const current = store.generos();
              patchState(store, { generos: current.filter((g) => g._id !== id), selectedGenero: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar género no musical', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedGenero: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
