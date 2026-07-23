describe('Módulo Materias - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/materias', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'm1', nombre: 'Música clásica', codigo: 'M001' },
          { _id: 'm2', nombre: 'Jazz', codigo: 'M002' },
        ],
      },
    }).as('materias');

    cy.visit('/materias');
    cy.wait('@verify');
    cy.wait('@materias');
  });

  it('muestra la lista de materias', () => {
    cy.contains('Materias').should('be.visible');
    cy.contains('Música clásica').should('be.visible');
    cy.contains('Jazz').should('be.visible');
  });

  it('permite crear una materia', () => {
    cy.intercept('POST', '**/api/materias', {
      statusCode: 200,
      body: {
        success: true,
        data: { _id: 'm3', nombre: 'Nueva Materia', codigo: 'M003' },
      },
    }).as('createMateria');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Nueva Materia');
    cy.get('input[formcontrolname="codigo"]').type('M003');
    cy.get('button[type="submit"]').click();
    cy.wait('@createMateria');
  });

  it('permite ver el detalle de una materia', () => {
    cy.contains('Música clásica').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/materias/m1');
    cy.contains('Música clásica').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar una materia', () => {
    cy.intercept('PUT', '**/api/materias/m1', {
      statusCode: 200,
      body: { success: true, message: 'Materia actualizada' },
    }).as('updateMateria');

    cy.contains('Música clásica').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Música Clásica Actualizada');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateMateria');
  });

  it('permite eliminar una materia', () => {
    cy.intercept('DELETE', '**/api/materias/m2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteMateria');

    cy.contains('Jazz').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteMateria');
  });
});