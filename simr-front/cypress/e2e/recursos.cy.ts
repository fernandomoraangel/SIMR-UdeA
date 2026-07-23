describe('Módulo Recursos - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/recursos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'r1', nombre: 'Recurso 1', tipo: 'digital', fecha: '2023-01-15' },
          { _id: 'r2', nombre: 'Recurso 2', tipo: 'físico', fecha: '2023-02-20' },
        ],
      },
    }).as('recursos');

    cy.visit('/recursos');
    cy.wait('@verify');
    cy.wait('@recursos');
  });

  it('muestra la lista de recursos', () => {
    cy.contains('Recursos').should('be.visible');
    cy.contains('Recurso 1').should('be.visible');
    cy.contains('Recurso 2').should('be.visible');
  });

  it('permite crear un recurso', () => {
    cy.intercept('POST', '**/api/recursos', {
      statusCode: 200,
      body: { success: true, data: { _id: 'r3', nombre: 'Recurso 3', tipo: 'digital', fecha: '2023-03-01' } },
    }).as('createRecurso');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Recurso 3');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Digital');
    cy.get('button[type="submit"]').click();
    cy.wait('@createRecurso');
  });

  it('permite ver el detalle de un recurso', () => {
    cy.contains('Recurso 1').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/recursos/r1');
    cy.contains('Recurso 1').should('be.visible');
    cy.contains('Digital').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un recurso', () => {
    cy.intercept('PUT', '**/api/recursos/r1', {
      statusCode: 200,
      body: { success: true, message: 'Recurso actualizado' },
    }).as('updateRecurso');

    cy.contains('Recurso 1').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Recurso 1 Actualizado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateRecurso');
  });

  it('permite eliminar un recurso', () => {
    cy.intercept('DELETE', '**/api/recursos/r2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteRecurso');

    cy.contains('Recurso 2').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteRecurso');
  });
});