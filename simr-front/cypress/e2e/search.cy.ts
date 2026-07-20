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
              descripcion: 'Registro de campo',
              genero: 'Bambuco',
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

  it('muestra la ayuda de búsqueda (booleanos y aproximada)', () => {
    cy.contains('Ayuda').click();
    cy.contains('Operadores booleanos').should('be.visible');
    cy.contains('Búsqueda aproximada').should('be.visible');
    cy.contains('bachata AND salsa').should('be.visible');
  });

  it('renderiza formato MARC 21 con tag y subfield', () => {
    cy.get('input[ng-reflect-name="q"]').type('mapa');
    cy.contains('Buscar').click();
    cy.wait('@search');
    cy.get('mat-select[ng-reflect-name="formato"]').click();
    cy.contains('MARC 21').click();
    cy.get('.marc-row').first().should('be.visible');
    cy.get('.marc-tag').first().should('contain.text', '245');
  });

  it('renderiza formato Dublin Core con elemento', () => {
    cy.get('input[ng-reflect-name="q"]').type('mapa');
    cy.contains('Buscar').click();
    cy.wait('@search');
    cy.get('mat-select[ng-reflect-name="formato"]').click();
    cy.contains('Dublin Core').click();
    cy.get('.dc-row').first().should('be.visible');
    cy.get('.dc-element').first().should('contain.text', 'dc:');
  });

  it('navega a la ficha del resultado', () => {
    cy.get('input[ng-reflect-name="q"]').type('mapa');
    cy.contains('Buscar').click();
    cy.wait('@search');
    cy.get('a.result-link').first().click();
    cy.url().should('include', '/no-implementado/obras/');
  });
});
