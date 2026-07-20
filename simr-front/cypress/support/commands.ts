// Comandos personalizados reutilizables en las pruebas e2e.
// Inicia sesión simulando el flujo de auth contra el backend real (o usando cy.intercept).
Cypress.Commands.add("loginAs", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("input[type=email], input[name=email]").type(email);
  cy.get("input[type=password], input[name=password]").type(password);
  cy.get("button[type=submit]").click();
  cy.url().should("not.include", "/login");
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
