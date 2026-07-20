/// <reference types="cypress" />

describe("Smoke test - arranque de Angular (Material)", () => {
  it("la app carga y muestra el shell con toolbar Material", () => {
    const errors: string[] = [];
    cy.on("window:error", (e) => errors.push(String(e)));
    cy.visit("/", { failOnStatusCode: false });
    cy.get("app-root", { timeout: 15000 }).should("exist");
    cy.get("app-shell mat-toolbar", { timeout: 15000 }).should("exist");
    cy.wrap(errors).should("have.length", 0);
  });

  it("shell sin sesión muestra bienvenida y menú de cuenta", () => {
    cy.visit("/", { failOnStatusCode: false });
    cy.contains("Bienvenido a nuestro Sistema de Información").should("exist");
    cy.get("app-shell button").contains("Cuenta").should("exist");
  });

  it("los enlaces del menú apuntan a rutas Angular reales", () => {
    // Verifica que el bundle del shell enlaza idiomas/diccionarios a Angular
    cy.visit("/", { failOnStatusCode: false });
    cy.request(
      "http://localhost:4200/main.js?cb=" + Date.now()
    ).then((resp) => {
      const body = resp.body as string;
      expect(body).to.match(/routerLink.*\/idiomas|\/idiomas/);
      expect(body).to.match(/\/no-implementado\//);
    });
  });
});
