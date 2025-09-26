// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Detectar automáticamente la URL base según el puerto actual
const getBaseUrl = () => {
  const currentPort = window.location.port;
  if (currentPort === '80' || currentPort === '') {
    // Si estamos en puerto 80 (nginx proxy), usar rutas relativas
    return window.location.origin;
  } else {
    // Si estamos en otro puerto, usar localhost:3000
    return 'http://localhost:3000';
  }
};

export const environment = {
  production: false,
  apiUrl: getBaseUrl() + '/api',
  originUrl: getBaseUrl(),
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
