// En: simr-front/src/app/features/archivos/archivo-subida/archivo-subida.component.ts
// Cambiar línea ~31:

// ANTES:
angularJSOrigin = 'http://localhost:3000'; // Dominio de la app AngularJS

// DESPUÉS:
angularJSOrigin = window.location.origin; // Usar el mismo origen (localhost:80)

// También en archivo-lista.component.ts hacer el mismo cambio

// OPCIONAL: Crear una constante en environment
// En: src/environments/environment.ts
export const environment = {
  production: false,
  angularJSOrigin: window.location.origin, // En lugar de localhost:3000
  // ... otras configuraciones
};