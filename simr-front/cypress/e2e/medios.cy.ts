describe('Módulo Medios - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/medios', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'd1', nombre: 'CD', tipo: 'digital' },
          { _id: 'd2', nombre: 'Vinilo', tipo: 'fisico' },
        ],
      },
    }).as('medios');

    cy.visit('/medios');
    cy.wait('@verify');
    cy.wait('@medios');
  });

  it('muestra la lista de medios', () => {
    cy.contains('Medios').should('be.visible');
    cy.contains('CD').should('be.visible');
    cy.contains('Vinilo').should('be.visible');
  });

  it('permite crear un medio', () => {
    cy.intercept('POST', '**/api/medios', {
      statusCode: 200,
      body: { success: true, data: { _id: 'd3', nombre: 'Cassettes', tipo: 'fisico' } },
    }).as('createMedio');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Cassettes');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Físico');
    cy.get('button[type="submit"]').click();
    cy.wait('@createMedio');
  });

  it('permite ver el detalle de un medio', () => {
    cy.contains('CD').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/medios/d1');
    cy.contains('CD').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un medio', () => {
    cy.intercept('PUT', '**/api/medios/d1', {
      statusCode: 200,
      body: { success: true, message: 'Medio actualizado' },
    }).as('updateMedio');

    cy.contains('CD').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('CD Digital');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateMedio');
  });

  it('permite eliminar un medio', () => {
    cy.intercept('DELETE', '**/api/medios/d2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteMedio');

    cy.contains('Vinilo').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteMedio');
  });
});