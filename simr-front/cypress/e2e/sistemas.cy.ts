describe('Módulo Sistemas - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/sistemas', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 's1', nombre: 'Sistema A', tipo: 'acústico' },
          { _id: 's2', nombre: 'Sistema B', tipo: 'eléctrico' },
        ],
      },
    }).as('sistemas');

    cy.visit('/sistemas');
    cy.wait('@verify');
    cy.wait('@sistemas');
  });

  it('muestra la lista de sistemas', () => {
    cy.contains('Sistemas').should('be.visible');
    cy.contains('Sistema A').should('be.visible');
    cy.contains('Sistema B').should('be.visible');
  });

  it('permite crear un sistema', () => {
    cy.intercept('POST', '**/api/sistemas', {
      statusCode: 200,
      body: { success: true, data: { _id: 's3', nombre: 'Sistema C', tipo: 'híbrido' } },
    }).as('createSistema');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Sistema C');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Híbrido');
    cy.get('button[type="submit"]').click();
    cy.wait('@createSistema');
  });

  it('permite ver el detalle de un sistema', () => {
    cy.contains('Sistema A').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/sistemas/s1');
    cy.contains('Sistema A').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un sistema', () => {
    cy.intercept('PUT', '**/api/sistemas/s1', {
      statusCode: 200,
      body: { success: true, message: 'Sistema actualizado' },
    }).as('updateSistema');

    cy.contains('Sistema A').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Sistema A Modificado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateSistema');
  });

  it('permite eliminar un sistema', () => {
    cy.intercept('DELETE', '**/api/sistemas/s2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteSistema');

    cy.contains('Sistema B').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteSistema');
  });
});