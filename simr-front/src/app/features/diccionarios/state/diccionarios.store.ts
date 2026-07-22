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
  Diccionario,
  CreateDiccionarioRequest,
  UpdateDiccionarioRequest,
} from '../domain/diccionario.interface';
import { DiccionariosService } from '../data/diccionarios.service';

interface DiccionariosState {
  diccionarios: Diccionario[];
  selectedDiccionario: Diccionario | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: DiccionariosState = {
  diccionarios: [],
  selectedDiccionario: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class DiccionariosStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    diccionariosCount: computed(() => store.diccionarios().length),
    hasDiccionarios: computed(() => store.diccionarios().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(DiccionariosService)) => ({
    loadDiccionarios: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((diccionarios) =>
              patchState(store, { diccionarios, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar diccionarios',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),
    loadDiccionarioById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((diccionario) =>
              patchState(store, {
                selectedDiccionario: diccionario,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar diccionario',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    createDiccionario: rxMethod<CreateDiccionarioRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newDiccionario) => {
              const current = store.diccionarios();
              patchState(store, {
                diccionarios: [newDiccionario, ...current],
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
                error: error.error?.message || 'Error al crear diccionario',
              });
              return of(null);
            })
          )
        )
      )
    ),
    updateDiccionario: rxMethod<{ id: string; data: UpdateDiccionarioRequest }>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.diccionarios();
              const updatedList = current.map((m) =>
                m._id === id ? updated : m
              );
              patchState(store, {
                diccionarios: updatedList,
                selectedDiccionario: updated,
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
                error: error.error?.message || 'Error al actualizar diccionario',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    deleteDiccionario: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const current = store.diccionarios();
              const filtered = current.filter((m) => m._id !== id);
              patchState(store, {
                diccionarios: filtered,
                selectedDiccionario: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar diccionario',
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
    clearSelection: () => patchState(store, { selectedDiccionario: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      patchState(store, { ...initialState });
    },
  }))
) {}
