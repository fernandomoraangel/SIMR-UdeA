describe('Módulo Actores - Gestión unificada (Fase 3.A)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            _id: 'admin1',
            username: 'fernando.mora',
            firstName: 'Fernando',
            lastName: 'Mora',
            roles: [{ name: 'admin' }],
          },
        },
      },
    }).as('verify');

    cy.intercept('GET', '**/api/actores', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'a1', nombres: 'Actor 1', apellidos: 'Apellido 1', tipo: 'persona' },
          { _id: 'a2', nombres: 'Actor 2', apellidos: 'Apellido 2', tipo: 'entidad' },
        ],
      },
    }).as('actores');

    cy.visit('/actores');
    cy.wait('@verify');
    cy.wait('@actores');
  });

  it('muestra la lista de actores', () => {
    cy.contains('Actores').should('be.visible');
    cy.contains('Actor 1').should('be.visible');
    cy.contains('Actor 2').should('be.visible');
  });

  it('permite crear un actor', () => {
    cy.intercept('POST', '**/api/actores', {
      statusCode: 200,
      body: { success: true, data: { _id: 'a3', nombres: 'Actor 3', apellidos: 'Apellido 3', tipo: 'persona' } },
    }).as('createActor');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombres"]').type('Actor 3');
    cy.get('input[formcontrolname="apellidos"]').type('Apellido 3');
    cy.get('button[type="submit"]').click();
    cy.wait('@createActor');
  });

  it('permite ver el detalle de un actor', () => {
    cy.contains('Actor 1').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/actores/a1');
    cy.contains('Actor 1').should('be.visible');
    cy.contains('Apellido 1').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un actor', () => {
    cy.intercept('PUT', '**/api/actores/a1', {
      statusCode: 200,
      body: { success: true, message: 'Actor actualizado' },
    }).as('updateActor');

    cy.contains('Actor 1').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombres"]').clear().type('Actor 1 Actualizado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateActor');
  });

  it('permite eliminar un actor', () => {
    cy.intercept('DELETE', '**/api/actores/a2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteActor');

    cy.contains('Actor 2').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteActor');
  });
});