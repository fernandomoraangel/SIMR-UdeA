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
  Medio,
  CreateMedioRequest,
  UpdateMedioRequest,
} from '../domain/medio.interface';
import { MediosService } from '../data/medios.service';

interface MediosState {
  medios: Medio[];
  selectedMedio: Medio | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: MediosState = {
  medios: [],
  selectedMedio: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class MediosStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    mediosCount: computed(() => store.medios().length),
    hasMedios: computed(() => store.medios().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(MediosService)) => ({
    loadMedios: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((medios) =>
              patchState(store, { medios, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar medios',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),
    loadMedioById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((medio) =>
              patchState(store, {
                selectedMedio: medio,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar medio',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    createMedio: rxMethod<CreateMedioRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newMedio) => {
              const currentMedios = store.medios();
              patchState(store, {
                medios: [newMedio, ...currentMedios],
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
                error: error.error?.message || 'Error al crear medio',
              });
              return of(null);
            })
          )
        )
      )
    ),
    updateMedio: rxMethod<{ id: string; data: UpdateMedioRequest }>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updatedMedio) => {
              const currentMedios = store.medios();
              const updatedMedios = currentMedios.map((m) =>
                m._id === id ? updatedMedio : m
              );
              patchState(store, {
                medios: updatedMedios,
                selectedMedio: updatedMedio,
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
                error: error.error?.message || 'Error al actualizar medio',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    deleteMedio: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const currentMedios = store.medios();
              const filteredMedios = currentMedios.filter(
                (m) => m._id !== id
              );
              patchState(store, {
                medios: filteredMedios,
                selectedMedio: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar medio',
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
    clearSelection: () => patchState(store, { selectedMedio: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      patchState(store, { ...initialState });
    },
  }))
) {}
