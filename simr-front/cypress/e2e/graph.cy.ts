describe('Módulo Graph - Visualización D3.js (Fase 4)', () => {
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

    cy.intercept('GET', '**/api/graph/data', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          nodes: [
            { id: 'n1', type: 'obra', nombre: 'Obra 1', color: '#FF5733' },
            { id: 'n2', type: 'actor', nombre: 'Actor 1', color: '#33FF57' },
          ],
          links: [
            { source: 'n1', target: 'n2', type: 'autor' },
          ],
        },
      },
    }).as('graphData');

    cy.intercept('GET', '**/api/graph/metadata', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          title: 'Grafo de relaciones',
          description: 'Visualización de relaciones entre entidades',
        },
      },
    }).as('graphMetadata');

    cy.visit('/graph');
    cy.wait('@verify');
    cy.wait('@graphData');
    cy.wait('@graphMetadata');
  });

  it('muestra el título del grafo', () => {
    cy.contains('Grafo de relaciones').should('be.visible');
  });

  it('renderiza los nodos del grafo', () => {
    cy.get('svg g.node').should('have.length.at.least', 2);
  });

  it('permite hacer zoom en el grafo', () => {
    cy.get('svg').trigger('wheel', { deltaY: -100 });
    cy.get('svg g.node').should('exist');
  });

  it('permite arrastrar nodos del grafo', () => {
    cy.get('svg g.node').first().trigger('mousedown').trigger('mousemove', { clientX: 100, clientY: 100 }).trigger('mouseup');
    cy.get('svg g.node').should('exist');
  });

  it('muestra el detalle de un nodo al hacer click', () => {
    cy.get('svg g.node').first().click();
    cy.contains('Cerrar').should('be.visible');
    cy.contains('Cerrar').click();
  });
});