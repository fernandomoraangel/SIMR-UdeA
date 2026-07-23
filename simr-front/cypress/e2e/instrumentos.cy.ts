describe('Módulo Instrumentos - Gestión con asistente Hornbostel-Sachs (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/instrumentos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'i1', nombre: 'Piano', clasificacion: '411.1' },
          { _id: 'i2', nombre: 'Violín', clasificacion: '422.1' },
        ],
      },
    }).as('instrumentos');

    cy.visit('/instrumentos');
    cy.wait('@verify');
    cy.wait('@instrumentos');
  });

  it('muestra la lista de instrumentos', () => {
    cy.contains('Instrumentos').should('be.visible');
    cy.contains('Piano').should('be.visible');
    cy.contains('Violín').should('be.visible');
  });

  it('permite crear un instrumento', () => {
    cy.intercept('POST', '**/api/instrumentos', {
      statusCode: 200,
      body: { success: true, data: { _id: 'i3', nombre: 'Guitarra', clasificacion: '422.2' } },
    }).as('createInstrumento');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Guitarra');
    cy.get('input[formcontrolname="clasificacion"]').type('422.2');
    cy.get('button[type="submit"]').click();
    cy.wait('@createInstrumento');
  });

  it('permite ver el detalle de un instrumento', () => {
    cy.contains('Piano').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/instrumentos/i1');
    cy.contains('Piano').should('be.visible');
    cy.contains('411.1').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un instrumento', () => {
    cy.intercept('PUT', '**/api/instrumentos/i1', {
      statusCode: 200,
      body: { success: true, message: 'Instrumento actualizado' },
    }).as('updateInstrumento');

    cy.contains('Piano').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Piano de Cola');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateInstrumento');
  });

  it('permite eliminar un instrumento', () => {
    cy.intercept('DELETE', '**/api/instrumentos/i2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteInstrumento');

    cy.contains('Violín').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteInstrumento');
  });

  it('muestra el badge de clasificación Hornbostel-Sachs en la lista', () => {
    cy.contains('Piano').should('be.visible');
    cy.contains('411.1').should('be.visible');
  });
});