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
  Instrumento,
  CreateInstrumentoRequest,
  UpdateInstrumentoRequest,
} from '../domain/instrumento.interface';
import { InstrumentosService } from '../data/instrumentos.service';

interface InstrumentosState {
  instrumentos: Instrumento[];
  selectedInstrumento: Instrumento | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: InstrumentosState = {
  instrumentos: [],
  selectedInstrumento: null,
  loading: false,
  error: null,
  success: false,
};

@Injectable()
export class InstrumentosStore extends signalStore(
  withState(initialState),
  withComputed((store) => ({
    instrumentosCount: computed(() => store.instrumentos().length),
    hasInstrumentos: computed(() => store.instrumentos().length > 0),
    isLoading: computed(() => store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, repository = inject(InstrumentosService)) => ({
    loadInstrumentos: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(() =>
          repository.getAll().pipe(
            tap((instrumentos) =>
              patchState(store, { instrumentos, loading: false, success: true })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar instrumentos',
                success: false,
              });
              return of([]);
            })
          )
        )
      )
    ),
    loadInstrumentoById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.getById(id).pipe(
            tap((instrumento) =>
              patchState(store, {
                selectedInstrumento: instrumento,
                loading: false,
                success: true,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al cargar instrumento',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    createInstrumento: rxMethod<CreateInstrumentoRequest>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap((data) =>
          repository.create(data).pipe(
            tap((newInstrumento) => {
              const current = store.instrumentos();
              patchState(store, {
                instrumentos: [newInstrumento, ...current],
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
                error: error.error?.message || 'Error al crear instrumento',
              });
              return of(null);
            })
          )
        )
      )
    ),
    updateInstrumento: rxMethod<{ id: string; data: UpdateInstrumentoRequest }>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, success: false })
        ),
        switchMap(({ id, data }) =>
          repository.update(id, data).pipe(
            tap((updatedInstrumento) => {
              const current = store.instrumentos();
              const updated = current.map((m) =>
                m._id === id ? updatedInstrumento : m
              );
              patchState(store, {
                instrumentos: updated,
                selectedInstrumento: updatedInstrumento,
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
                error: error.error?.message || 'Error al actualizar instrumento',
                success: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
    deleteInstrumento: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          repository.delete(id).pipe(
            tap(() => {
              const current = store.instrumentos();
              const filtered = current.filter((m) => m._id !== id);
              patchState(store, {
                instrumentos: filtered,
                selectedInstrumento: null,
                loading: false,
                success: true,
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Error al eliminar instrumento',
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
    clearSelection: () => patchState(store, { selectedInstrumento: null }),
    clearSuccess: () => patchState(store, { success: false }),
    setInitialState: () => {
      patchState(store, { ...initialState });
    },
  }))
) {}
