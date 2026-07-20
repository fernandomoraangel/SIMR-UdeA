/// <reference types="cypress" />

describe("Smoke test - arranque de Angular", () => {
  it("la app carga y muestra el shell", () => {
    cy.visit("/");
    cy.get("app-root").should("exist");
  });
});
