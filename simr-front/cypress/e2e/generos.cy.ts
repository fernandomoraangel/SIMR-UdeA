describe('Módulo Géneros - Gestión con relaciones (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/generos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'g1',
            nombre: 'Clásico',
            padre: null,
            idiomas: [{ _id: 'l1', nombre: 'Español' }],
            medios: [{ _id: 'd1', nombre: 'CD' }],
          },
          {
            _id: 'g2',
            nombre: 'Jazz',
            padre: null,
            idiomas: [{ _id: 'l2', nombre: 'Inglés' }],
            medios: [{ _id: 'd2', nombre: 'Vinilo' }],
          },
        ],
      },
    }).as('generos');

    cy.visit('/generos');
    cy.wait('@verify');
    cy.wait('@generos');
  });

  it('muestra la lista de géneros', () => {
    cy.contains('Géneros').should('be.visible');
    cy.contains('Clásico').should('be.visible');
    cy.contains('Jazz').should('be.visible');
  });

  it('permite crear un género', () => {
    cy.intercept('POST', '**/api/generos', {
      statusCode: 200,
      body: { success: true, data: { _id: 'g3', nombre: 'Rock', padre: null } },
    }).as('createGenero');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Rock');
    cy.get('button[type="submit"]').click();
    cy.wait('@createGenero');
  });

  it('permite ver el detalle de un género', () => {
    cy.contains('Clásico').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/generos/g1');
    cy.contains('Clásico').should('be.visible');
    cy.contains('Idiomas').should('be.visible');
    cy.contains('CD').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un género', () => {
    cy.intercept('PUT', '**/api/generos/g1', {
      statusCode: 200,
      body: { success: true, message: 'Género actualizado' },
    }).as('updateGenero');

    cy.contains('Clásico').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Clásico Moderno');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateGenero');
  });

  it('permite eliminar un género', () => {
    cy.intercept('DELETE', '**/api/generos/g2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteGenero');

    cy.contains('Jazz').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteGenero');
  });
});