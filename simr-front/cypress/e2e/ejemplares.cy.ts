describe('Módulo Ejemplares - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/ejemplares', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'e1',
            numeroEjemplar: 'E-001',
            disponibilidad: 'disponible',
            fondo: { _id: 'f1', nombre: 'Fondo A' },
            coleccion: { _id: 'c1', nombre: 'Colección A' },
          },
          {
            _id: 'e2',
            numeroEjemplar: 'E-002',
            disponibilidad: 'prestado',
            fondo: { _id: 'f2', nombre: 'Fondo B' },
            coleccion: { _id: 'c2', nombre: 'Colección B' },
          },
        ],
      },
    }).as('ejemplares');

    cy.visit('/ejemplares');
    cy.wait('@verify');
    cy.wait('@ejemplares');
  });

  it('muestra la lista de ejemplares', () => {
    cy.contains('Ejemplares').should('be.visible');
    cy.contains('E-001').should('be.visible');
    cy.contains('E-002').should('be.visible');
  });

  it('permite crear un ejemplar', () => {
    cy.intercept('POST', '**/api/ejemplares', {
      statusCode: 200,
      body: { success: true, data: { _id: 'e3', numeroEjemplar: 'E-003', disponibilidad: 'disponible' } },
    }).as('createEjemplar');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="numeroEjemplar"]').type('E-003');
    cy.get('select[formcontrolname="disponibilidad"] option').should('contain.text', 'Disponible');
    cy.get('button[type="submit"]').click();
    cy.wait('@createEjemplar');
  });

  it('permite ver el detalle de un ejemplar', () => {
    cy.contains('E-001').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/ejemplares/e1');
    cy.contains('E-001').should('be.visible');
    cy.contains('Disponible').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un ejemplar', () => {
    cy.intercept('PUT', '**/api/ejemplares/e1', {
      statusCode: 200,
      body: { success: true, message: 'Ejemplar actualizado' },
    }).as('updateEjemplar');

    cy.contains('E-001').parent().find('button[aria-label="Editar"]').click();
    cy.get('select[formcontrolname="disponibilidad"]').select('prestado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateEjemplar');
  });

  it('permite eliminar un ejemplar', () => {
    cy.intercept('DELETE', '**/api/ejemplares/e2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteEjemplar');

    cy.contains('E-002').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteEjemplar');
  });
});