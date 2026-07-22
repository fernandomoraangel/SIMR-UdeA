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
  Materia,
  CreateMateriaRequest,
  UpdateMateriaRequest,
} from '../domain/materia.interface';
import { MateriasService } from '../data/materias.service';

interface MateriasState {
  materias: Materia[];
  selectedMateria: Materia | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: MateriasState = {
  materias: [],
  selectedMateria: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class MateriasStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    materiasCount: computed(() => store.materias().length),
    hasMaterias: computed(() => store.materias().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(MateriasService)) => ({
    loadMaterias: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((materias) =>
              patchState(store, { materias, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar materias',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),
    loadMateriaById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((materia) =>
              patchState(store, {
                selectedMateria: materia,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar materia',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    createMateria: rxMethod<CreateMateriaRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newMateria) => {
              const currentMaterias = store.materias();
              patchState(store, {
                materias: [newMateria, ...currentMaterias],
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
                error: error.error?.message || 'Error al crear materia',
              });
              return of(null);
            })
          )
        )
      )
    ),
    updateMateria: rxMethod<{ id: string; data: UpdateMateriaRequest }>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updatedMateria) => {
              const currentMaterias = store.materias();
              const updatedMaterias = currentMaterias.map((m) =>
                m._id === id ? updatedMateria : m
              );
              patchState(store, {
                materias: updatedMaterias,
                selectedMateria: updatedMateria,
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
                error: error.error?.message || 'Error al actualizar materia',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    deleteMateria: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const currentMaterias = store.materias();
              const filteredMaterias = currentMaterias.filter(
                (m) => m._id !== id
              );
              patchState(store, {
                materias: filteredMaterias,
                selectedMateria: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar materia',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    clearSelection: () => patchState(store, { selectedMateria: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      patchState(store, { ...initialState });
    },
  }))
) {}
