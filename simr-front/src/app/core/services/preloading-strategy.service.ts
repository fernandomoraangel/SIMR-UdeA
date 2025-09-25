// import { Injectable } from '@angular/core';
// import { PreloadingStrategy, Route } from '@angular/router';
// import { Observable, of, timer } from 'rxjs';

// /**
//  * Estrategia de precarga personalizada para módulos críticos
//  */
// @Injectable({
//   providedIn: 'root',
// })
// export class CustomPreloadingStrategy implements PreloadingStrategy {
//   preload(route: Route, load: () => Observable<any>): Observable<any> {
//     // Lista de módulos críticos que deben precargarse inmediatamente
//     const criticalModules = [
//       'diccionarios',
//       'actores',
//       'idiomas',
//       'instrumentos',
//     ];

//     // Lista de módulos que se precargan con delay
//     const delayedModules = ['obras', 'eventos', 'lugares'];

//     if (route.path && criticalModules.includes(route.path)) {
//       // Precarga inmediata para módulos críticos
//       console.log('Preloading critical module:', route.path);
//       return load();
//     } else if (route.path && delayedModules.includes(route.path)) {
//       // Precarga con delay para módulos menos críticos
//       console.log('Delayed preloading module:', route.path);
//       return timer(2000).switchMap(() => load());
//     }

//     // No precargar otros módulos
//     return of(null);
//   }
// }
