// import { Injectable, inject, computed } from '@angular/core';
// import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';
// import { switchMap, pipe, catchError, of, tap } from 'rxjs';
// import { Idioma, CreateIdiomaRequest, UpdateIdiomaRequest } from '../models/idioma.model';
// import { IdiomaService } from '../data/idiomas.service';

// interface IdiomasState {
//   idiomas: Idioma[];
//   selectedIdioma: Idioma | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: IdiomasState = {
//   idiomas: [],
//   selectedIdioma: null,
//   loading: false,
//   error: null
// };

// @Injectable()
// export class IdiomasStore extends signalStore(
//   withState(initialState),
//   withComputed((store) => ({
//     idiomasCount: computed(() => store.idiomas().length),
//     hasIdiomas: computed(() => store.idiomas().length > 0),
//     isLoading: computed(() => store.loading()),
//     hasError: computed(() => !!store.error())
//   })),
//   withMethods((store, repository = inject(IdiomaService)) => ({

//     loadIdiomas: rxMethod<void>(
//       pipe(
//         tap(() => store.patchState({ loading: true, error: null })),
//         switchMap(() =>
//           repository.getAll().pipe(
//             tap((idiomas) => store.patchState({ idiomas, loading: false })),
//             catchError((error) => {
//               store.patchState({
//                 loading: false,
//                 error: error.error?.message || 'Error al cargar idiomas'
//               });
//               return of([]);
//             })
//           )
//         )
//       )
//     ),

//     loadIdiomaById: rxMethod<string>(
//       pipe(
//         tap(() => store.patchState({ loading: true, error: null })),
//         switchMap((id) =>
//           repository.getById(id).pipe(
//             tap((idioma) => store.patchState({ selectedIdioma: idioma, loading: false })),
//             catchError((error) => {
//               store.patchState({
//                 loading: false,
//                 error: error.error?.message || 'Error al cargar idioma'
//               });
//               return of(null);
//             })
//           )
//         )
//       )
//     ),

//     createIdioma: rxMethod<CreateIdiomaRequest>(
//       pipe(
//         tap(() => store.patchState({ loading: true, error: null })),
//         switchMap((request) =>
//           repository.create(request).pipe(
//             tap((newIdioma) => {
//               const currentIdiomas = store.idiomas();
//               store.patchState({
//                 idiomas: [newIdioma, ...currentIdiomas],
//                 loading: false
//               });
//             }),
//             catchError((error) => {
//               store.patchState({
//                 loading: false,
//                 error: error.error?.message || 'Error al crear idioma'
//               });
//               return of(null);
//             })
//           )
//         )
//       )
//     ),

//     updateIdioma: rxMethod<{ id: string; data: UpdateIdiomaRequest }>(
//       pipe(
//         tap(() => store.patchState({ loading: true, error: null })),
//         switchMap(({ id, data }) =>
//           repository.update(id, data).pipe(
//             tap((updatedIdioma) => {
//               const currentIdiomas = store.idiomas();
//               const updatedIdiomas = currentIdiomas.map(idioma =>
//                 idioma._id === id ? updatedIdioma : idioma
//               );
//               store.patchState({
//                 idiomas: updatedIdiomas,
//                 selectedIdioma: updatedIdioma,
//                 loading: false
//               });
//             }),
//             catchError((error) => {
//               store.patchState({
//                 loading: false,
//                 error: error.error?.message || 'Error al actualizar idioma'
//               });
//               return of(null);
//             })
//           )
//         )
//       )
//     ),

//     deleteIdioma: rxMethod<string>(
//       pipe(
//         tap(() => store.patchState({ loading: true, error: null })),
//         switchMap((id) =>
//           repository.delete(id).pipe(
//             tap(() => {
//               const currentIdiomas = store.idiomas();
//               const filteredIdiomas = currentIdiomas.filter(idioma => idioma._id !== id);
//               store.patchState({
//                 idiomas: filteredIdiomas,
//                 selectedIdioma: null,
//                 loading: false
//               });
//             }),
//             catchError((error) => {
//               store.patchState({
//                 loading: false,
//                 error: error.error?.message || 'Error al eliminar idioma'
//               });
//               return of(null);
//             })
//           )
//         )
//       )
//     ),

//     clearError: () => store.patchState({ error: null }),
//     clearSelection: () => store.patchState({ selectedIdioma: null })
//   }))
// ) {}
