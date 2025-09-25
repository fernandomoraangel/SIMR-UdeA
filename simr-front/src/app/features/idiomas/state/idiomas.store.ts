import { Injectable, inject, computed } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, catchError, of, tap, finalize } from 'rxjs';
import {
  Idioma,
  CreateIdiomaRequest,
  UpdateIdiomaRequest,
} from '../domain/idioma.interface';
import { IdiomaService } from '../data/idiomas.service';

interface IdiomasState {
  idiomas: Idioma[];
  selectedIdioma: Idioma | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: IdiomasState = {
  idiomas: [],
  selectedIdioma: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class IdiomasStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    idiomasCount: computed(() => store.idiomas().length),
    hasIdiomas: computed(() => store.idiomas().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(IdiomaService)) => ({
    loadIdiomas: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((idiomas) =>
              patchState(store, { idiomas, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar idiomas',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),

    loadIdiomaById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((idioma) =>
              patchState(store, {
                selectedIdioma: idioma,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar idioma',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),

    createIdioma: rxMethod<CreateIdiomaRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newIdioma) => {
              const currentIdiomas = store.idiomas();
              patchState(store, {
                idiomas: [newIdioma, ...currentIdiomas],
                loading: false,
                success: true,
              });
            }),
            finalize(() => {
              // Marcar como exitoso después de completar la operación
              patchState(store, { success: false });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al crear idioma',
              });
              return of(null);
            })
          )
        )
      )
    ),

    updateIdioma: rxMethod<{ id: string; data: UpdateIdiomaRequest }>(
      pipe(
        tap(() =>
          patchState(store, {
            loading: true,
            error: null,
            success: false,
          })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updatedIdioma) => {
              const currentIdiomas = store.idiomas();
              const updatedIdiomas = currentIdiomas.map((idioma) =>
                idioma._id === id ? updatedIdioma : idioma
              );
              patchState(store, {
                idiomas: updatedIdiomas,
                selectedIdioma: updatedIdioma,
                loading: false,
                success: true,
              });
            }),
            finalize(() => {
              // Marcar como exitoso después de completar la operación
              patchState(store, { success: false });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al actualizar idioma',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),

    deleteIdioma: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const currentIdiomas = store.idiomas();
              const filteredIdiomas = currentIdiomas.filter(
                (idioma) => idioma._id !== id
              );
              patchState(store, {
                idiomas: filteredIdiomas,
                selectedIdioma: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar idioma',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),

    clearError: () => patchState(store, { error: null }),
    clearSelection: () => patchState(store, { selectedIdioma: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      console.log('[idiomas.store] Resetting state');
      patchState(store, { ...initialState });
    },
  }))
) {}
