describe('Módulo Search (Fase 1.3)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            _id: 'u1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'SIMR',
            roles: [{ name: 'admin' }],
          },
        },
      },
    }).as('verify');

    cy.intercept('GET', '**/api/search/metadata', {
      statusCode: 200,
      body: {
        success: true,
        entities: ['Obra', 'Actor', 'Idioma'],
        metadata: {},
        operators: ['AND', 'OR'],
        examples: ['mapa'],
      },
    }).as('metadata');

    cy.intercept('GET', '**/api/search', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          query: 'mapa',
          results: [
            {
              _id: 'o1',
              _entityType: 'Obra',
              _searchScore: 1,
              titulo: 'Mapa sonoro',
              creado: '2024-01-01T00:00:00Z',
            },
          ],
          total: 1,
        },
      });
    }).as('search');

    cy.visit('/angular/search');
    cy.wait('@verify');
    cy.wait('@metadata');
  });

  it('realiza una búsqueda y muestra resultados', () => {
    cy.get('input[ng-reflect-name="q"]').type('mapa');
    cy.contains('Buscar').click();
    cy.wait('@search');
    cy.contains('Mapa sonoro').should('be.visible');
    cy.contains('1 resultado(s)').should('exist');
  });

  it('navega a la ficha del resultado', () => {
    cy.get('input[ng-reflect-name="q"]').type('mapa');
    cy.contains('Buscar').click();
    cy.wait('@search');
    cy.get('a.result-link').first().click();
    cy.url().should('include', '/no-implementado/obras/');
  });
});
