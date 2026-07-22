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
  Coleccion,
  CreateColeccionRequest,
  UpdateColeccionRequest,
} from '../domain/coleccion.interface';
import { ColeccionesService } from '../data/colecciones.service';

interface ColeccionesState {
  colecciones: Coleccion[];
  selectedColeccion: Coleccion | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ColeccionesState = {
  colecciones: [],
  selectedColeccion: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class ColeccionesStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    coleccionesCount: computed(() => store.colecciones().length),
    hasColecciones: computed(() => store.colecciones().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(ColeccionesService)) => ({
    loadColecciones: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((colecciones) =>
              patchState(store, { colecciones, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar colecciones',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),
    loadColeccionById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((coleccion) =>
              patchState(store, {
                selectedColeccion: coleccion,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar colección',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    createColeccion: rxMethod<CreateColeccionRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newColeccion) => {
              const currentColecciones = store.colecciones();
              patchState(store, {
                colecciones: [newColeccion, ...currentColecciones],
                loading: false,
                success: true,
              });
            }),
            finalize(() => {
              patchState(store, { success: false });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al crear colección',
              });
              return of(null);
            })
          )
        )
      )
    ),
    updateColeccion: rxMethod<{ id: string; data: UpdateColeccionRequest }>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updatedColeccion) => {
              const currentColecciones = store.colecciones();
              const updatedColecciones = currentColecciones.map((c) =>
                c._id === id ? updatedColeccion : c
              );
              patchState(store, {
                colecciones: updatedColecciones,
                selectedColeccion: updatedColeccion,
                loading: false,
                success: true,
              });
            }),
            finalize(() => {
              patchState(store, { success: false });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al actualizar colección',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    deleteColeccion: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const currentColecciones = store.colecciones();
              const filteredColecciones = currentColecciones.filter(
                (c) => c._id !== id
              );
              patchState(store, {
                colecciones: filteredColecciones,
                selectedColeccion: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar colección',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedColeccion: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      patchState(store, { ...initialState });
    },
  }))
) {}
