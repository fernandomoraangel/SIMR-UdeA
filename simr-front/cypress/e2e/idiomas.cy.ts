describe('Módulo Idiomas - Gestión con enfoque decolonial (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/idiomas', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'l1',
            nombre: 'Español',
            isoCode: 'es',
            glottocode: 'espa1234',
            familiaLinguistica: 'Indoeuropeo',
            transmission: 'vertical',
          },
          {
            _id: 'l2',
            nombre: 'Quechua',
            isoCode: 'qu',
            glottocode: 'quec1234',
            familiaLinguistica: 'Amerindiana',
            transmission: 'horizontal',
          },
        ],
      },
    }).as('idiomas');

    cy.visit('/idiomas');
    cy.wait('@verify');
    cy.wait('@idiomas');
  });

  it('muestra la lista de idiomas', () => {
    cy.contains('Idiomas').should('be.visible');
    cy.contains('Español').should('be.visible');
    cy.contains('Quechua').should('be.visible');
  });

  it('permite crear un idioma', () => {
    cy.intercept('POST', '**/api/idiomas', {
      statusCode: 200,
      body: { success: true, data: { _id: 'l3', nombre: 'Guaraní', isoCode: 'gn', glottocode: 'guar1234', familiaLinguistica: 'Amerindiana', transmission: 'horizontal' } },
    }).as('createIdioma');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Guaraní');
    cy.get('input[formcontrolname="isoCode"]').type('gn');
    cy.get('input[formcontrolname="glottocode"]').type('guar1234');
    cy.get('button[type="submit"]').click();
    cy.wait('@createIdioma');
  });

  it('permite ver el detalle de un idioma', () => {
    cy.contains('Español').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/idiomas/l1');
    cy.contains('Español').should('be.visible');
    cy.contains('es').should('be.visible');
    cy.contains('Indoeuropeo').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un idioma', () => {
    cy.intercept('PUT', '**/api/idiomas/l1', {
      statusCode: 200,
      body: { success: true, message: 'Idioma actualizado' },
    }).as('updateIdioma');

    cy.contains('Español').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Español Moderno');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateIdioma');
  });

  it('permite eliminar un idioma', () => {
    cy.intercept('DELETE', '**/api/idiomas/l2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteIdioma');

    cy.contains('Quechua').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteIdioma');
  });
});