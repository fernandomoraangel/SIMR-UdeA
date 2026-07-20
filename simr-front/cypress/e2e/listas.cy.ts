describe('Módulo Listas (Fase 1.2)', () => {
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

    cy.intercept('GET', '**/api/listas', {
      statusCode: 200,
      body: [
        {
          _id: '1',
          nombre_lista: 'tipos',
          elementos: ['Libro', 'Mapa'],
          fecha_modificacion: '2024-01-01T10:00:00Z',
        },
        {
          _id: '2',
          nombre_lista: 'nNormalizados',
          elementos: ['DOI'],
          metadata: [{ sigla: 'DOI', frase: 'Digital Object Identifier' }],
        },
      ],
    }).as('listas');

    cy.visit('/angular/listas');
    cy.wait('@verify');
    cy.wait('@listas');
  });

  it('muestra el listado de listas y permite seleccionar', () => {
    cy.contains('Listas de referencia').should('be.visible');
    cy.get('mat-nav-list a').should('have.length.at.least', 2);
    cy.contains('nNormalizados').click();
    cy.contains('Digital Object Identifier').should('be.visible');
  });

  it('agrega un elemento a una lista (admin)', () => {
    cy.intercept('POST', '**/api/listas/tipos/elementos', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            _id: '1',
            nombre_lista: 'tipos',
            elementos: ['Libro', 'Mapa', 'Partitura'],
          },
        },
      });
    }).as('add');

    cy.contains('tipos').click();
    cy.get('input[ng-reflect-ng-model="newElement"], input').first().type('Partitura');
    cy.contains('Agregar').click();
    cy.wait('@add');
    cy.contains('Partitura').should('exist');
  });
});
