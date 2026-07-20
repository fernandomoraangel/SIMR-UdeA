import "./commands";

// Capturar errores de consola y runtime para diagnóstico en tests
Cypress.on("window:error", (error) => {
  cy.task("logError", "window:error: " + (error?.stack || error?.message || error), {
    log: false,
  });
});

Cypress.on("fail", (error) => {
  return error;
});
