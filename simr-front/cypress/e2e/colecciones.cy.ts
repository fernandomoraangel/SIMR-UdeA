describe('Módulo Colecciones - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/colecciones', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'c1', nombre: 'Colección A', tipo: 'digital', propietario: 'Biblioteca' },
          { _id: 'c2', nombre: 'Colección B', tipo: 'física', propietario: 'Archivo' },
        ],
      },
    }).as('colecciones');

    cy.visit('/colecciones');
    cy.wait('@verify');
    cy.wait('@colecciones');
  });

  it('muestra la lista de colecciones', () => {
    cy.contains('Colecciones').should('be.visible');
    cy.contains('Colección A').should('be.visible');
    cy.contains('Colección B').should('be.visible');
  });

  it('permite crear una colección', () => {
    cy.intercept('POST', '**/api/colecciones', {
      statusCode: 200,
      body: { success: true, data: { _id: 'c3', nombre: 'Colección C', tipo: 'digital', propietario: 'Museo' } },
    }).as('createColeccion');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Colección C');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Digital');
    cy.get('input[formcontrolname="propietario"]').type('Museo');
    cy.get('button[type="submit"]').click();
    cy.wait('@createColeccion');
  });

  it('permite ver el detalle de una colección', () => {
    cy.contains('Colección A').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/colecciones/c1');
    cy.contains('Colección A').should('be.visible');
    cy.contains('Biblioteca').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar una colección', () => {
    cy.intercept('PUT', '**/api/colecciones/c1', {
      statusCode: 200,
      body: { success: true, message: 'Colección actualizada' },
    }).as('updateColeccion');

    cy.contains('Colección A').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Colección A Actualizada');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateColeccion');
  });

  it('permite eliminar una colección', () => {
    cy.intercept('DELETE', '**/api/colecciones/c2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteColeccion');

    cy.contains('Colección B').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteColeccion');
  });
});