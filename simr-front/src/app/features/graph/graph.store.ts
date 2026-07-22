import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, filter } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { GraphService } from './graph.service';
import { EntityDisplay, GraphData } from './graph.interface';

interface GraphState {
  entities: EntityDisplay[];
  graphData: GraphData | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: GraphState = {
  entities: [],
  graphData: null,
  loading: false,
  error: null,
  searchQuery: '',
};

export const GraphStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, graphService = inject(GraphService)) => ({
    loadMetadata: rxMethod<void>(
      pipe(
        switchMap(() =>
          graphService.getMetadata().pipe(
            tapResponse({
              next: (res: any) => {
                if (res.success && res.metadata) {
                  const all = res.metadata.availableEntities || [];
                  patchState(store, {
                    entities: all.map((key: string) => ({
                      key,
                      name: key,
                      color: res.metadata.colors[key] || '#999',
                      count: res.metadata.totalCounts[key] || 0,
                      selected: true,
                    })),
                  });
                }
              },
              error: () => {},
            })
          )
        )
      )
    ),
    loadGraph: rxMethod<{ entities: string[]; query: string | null }>(
      pipe(
        filter(({ entities }) => entities.length > 0),
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ entities, query }) =>
          graphService.getGraphData({ entities, query, limit: 100 }).pipe(
            tapResponse({
              next: (res: any) => {
                if (res.success) {
                  patchState(store, { graphData: res.data, loading: false });
                } else {
                  patchState(store, { error: res.message || 'Error cargando grafo', loading: false });
                }
              },
              error: (err: HttpErrorResponse) => patchState(store, { error: err.message || 'Error de conexión', loading: false }),
            })
          )
        )
      )
    ),
    toggleEntity(key: string) {
      patchState(store, {
        entities: store.entities().map((e) =>
          e.key === key ? { ...e, selected: !e.selected } : e
        ),
      });
    },
    selectAllEntities() {
      patchState(store, {
        entities: store.entities().map((e) => ({ ...e, selected: true })),
      });
    },
    clearEntitySelection() {
      patchState(store, {
        entities: store.entities().map((e) => ({ ...e, selected: false })),
      });
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },
    setError(message: string) {
      patchState(store, { error: message });
    },
    clearGraph() {
      patchState(store, { graphData: null, error: null });
    },
  }))
);
