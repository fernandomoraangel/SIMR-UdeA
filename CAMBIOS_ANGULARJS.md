// En: simr-back/public/actores/controllers/actores.client.controller.js
// Cambiar línea ~611:

// ANTES:
var angularAppOrigin = "http://localhost:4200"; // Dominio de la app Angular

// DESPUÉS:
var angularAppOrigin = window.location.origin; // Usar el mismo origen (localhost:80)

// Y cambiar la URL del popup en ~635:
// ANTES:
angularWindowFileUpload = window.open(
  angularAppOrigin + "/files/upload",
  "AngularApp", 
  "width=563,height=365"
);

// DESPUÉS:
angularWindowFileUpload = window.open(
  "/files/upload",  // Ruta relativa, mismo origen
  "AngularApp",
  "width=563,height=365"
);