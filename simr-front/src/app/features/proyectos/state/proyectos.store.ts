import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, pipe, tap, catchError, of } from 'rxjs';
import { Proyecto, CreateProyectoRequest, UpdateProyectoRequest } from '../domain/proyecto.interface';
import { ProyectosService } from '../data/proyectos.service';

interface ProyectosState {
  proyectos: Proyecto[];
  selectedProyecto: Proyecto | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProyectosState = {
  proyectos: [],
  selectedProyecto: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class ProyectosStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    proyectosCount: computed(() => store.proyectos().length),
    hasProyectos: computed(() => store.proyectos().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(ProyectosService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(() =>
          repository.getAll().pipe(
            tap((proyectos) => patchState(store, { proyectos, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar proyectos', success: false });
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
            tap((proyecto) => patchState(store, { selectedProyecto: proyecto, loading: false, success: true })),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al cargar proyecto', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    create: rxMethod<CreateProyectoRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newItem) => {
              const current = store.proyectos();
              patchState(store, { proyectos: [newItem, ...current], loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al crear proyecto' });
              return of(null);
            })
          )
        )
      )
    ),
    update: rxMethod<{ id: string; data: UpdateProyectoRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null, success: false })),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updated) => {
              const current = store.proyectos();
              const updatedList = current.map((s) => (s._id === id ? updated : s));
              patchState(store, { proyectos: updatedList, selectedProyecto: updated, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al actualizar proyecto', success: false });
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
              const current = store.proyectos();
              patchState(store, { proyectos: current.filter((s) => s._id !== id), selectedProyecto: null, loading: false, success: true });
            }),
            catchError((error) => {
              patchState(store, { loading: false, error: error.error?.message || 'Error al eliminar proyecto', success: false });
              return of(null);
            })
          )
        )
      )
    ),
    clearError: () => patchState(store, { error: null }),
    setError: (message: string) => patchState(store, { error: message, loading: false }),
    clearSelection: () => patchState(store, { selectedProyecto: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => patchState(store, { ...initialState }),
  }))
) {}
