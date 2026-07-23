describe('Módulo Fondos - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/fondos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'f1', nombre: 'Fondo A', tipo: 'coleccion', propietario: 'Universidad' },
          { _id: 'f2', nombre: 'Fondo B', tipo: 'comodato', propietario: 'Donante' },
        ],
      },
    }).as('fondos');

    cy.visit('/fondos');
    cy.wait('@verify');
    cy.wait('@fondos');
  });

  it('muestra la lista de fondos', () => {
    cy.contains('Fondos').should('be.visible');
    cy.contains('Fondo A').should('be.visible');
    cy.contains('Fondo B').should('be.visible');
  });

  it('permite crear un fondo', () => {
    cy.intercept('POST', '**/api/fondos', {
      statusCode: 200,
      body: { success: true, data: { _id: 'f3', nombre: 'Fondo C', tipo: 'coleccion', propietario: 'Instituto' } },
    }).as('createFondo');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Fondo C');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Colección');
    cy.get('input[formcontrolname="propietario"]').type('Instituto');
    cy.get('button[type="submit"]').click();
    cy.wait('@createFondo');
  });

  it('permite ver el detalle de un fondo', () => {
    cy.contains('Fondo A').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/fondos/f1');
    cy.contains('Fondo A').should('be.visible');
    cy.contains('Universidad').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un fondo', () => {
    cy.intercept('PUT', '**/api/fondos/f1', {
      statusCode: 200,
      body: { success: true, message: 'Fondo actualizado' },
    }).as('updateFondo');

    cy.contains('Fondo A').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Fondo A Actualizado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateFondo');
  });

  it('permite eliminar un fondo', () => {
    cy.intercept('DELETE', '**/api/fondos/f2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteFondo');

    cy.contains('Fondo B').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteFondo');
  });
});