describe('Módulo Estadísticas - Dashboard con Chart.js (Fase 5.1)', () => {
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

    cy.intercept('GET', '**/api/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalObras: 150,
          totalInstrumentos: 350,
          totalGeneros: 80,
          totalActores: 200,
          grafico: {
            labels: ['Enero', 'Febrero', 'Marzo'],
            datasets: [{ label: 'Obras creadas', data: [10, 20, 15], backgroundColor: '#FF5733' }],
          },
        },
      },
    }).as('stats');

    cy.visit('/estadisticas');
    cy.wait('@verify');
    cy.wait('@stats');
  });

  it('muestra las estadísticas principales', () => {
    cy.contains('Estadísticas').should('be.visible');
    cy.contains('150').should('be.visible');
    cy.contains('350').should('be.visible');
    cy.contains('80').should('be.visible');
    cy.contains('200').should('be.visible');
  });

  it('muestra el gráfico de barras', () => {
    cy.get('canvas').should('exist');
    cy.get('canvas').should('have.attr', 'role', 'img');
  });

  it('permite filtrar por entidad', () => {
    cy.intercept('GET', '**/api/stats?entidad=instrumentos', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalObras: 0,
          totalInstrumentos: 350,
          totalGeneros: 0,
          totalActores: 0,
          grafico: {
            labels: ['2023'],
            datasets: [{ label: 'Instrumentos creados', data: [350], backgroundColor: '#33FF57' }],
          },
        },
      },
    }).as('statsFiltered');

    cy.get('select[formcontrolname="entidad"]').select('instrumentos');
    cy.wait('@statsFiltered');
    cy.contains('350').should('be.visible');
  });

  it('permite buscar por palabras clave', () => {
    cy.intercept('GET', '**/api/stats?q=piano', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalObras: 10,
          totalInstrumentos: 5,
          totalGeneros: 2,
          totalActores: 3,
          grafico: {
            labels: ['Resultados'],
            datasets: [{ label: 'Resultados para "piano"', data: [10], backgroundColor: '#3333FF' }],
          },
        },
      },
    }).as('statsSearch');

    cy.get('input[formcontrolname="q"]').type('piano');
    cy.wait('@statsSearch');
    cy.contains('10').should('be.visible');
  });
});