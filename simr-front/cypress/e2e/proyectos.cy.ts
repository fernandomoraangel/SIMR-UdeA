describe('Módulo Proyectos - Gestión unificada (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/proyectos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'p1',
            nombre: 'Proyecto A',
            estado: 'activo',
            investigadores: [{ _id: 'a1', nombre: 'Actor 1' }],
          },
          {
            _id: 'p2',
            nombre: 'Proyecto B',
            estado: 'finalizado',
            investigadores: [{ _id: 'a2', nombre: 'Actor 2' }],
          },
        ],
      },
    }).as('proyectos');

    cy.visit('/proyectos');
    cy.wait('@verify');
    cy.wait('@proyectos');
  });

  it('muestra la lista de proyectos', () => {
    cy.contains('Proyectos').should('be.visible');
    cy.contains('Proyecto A').should('be.visible');
    cy.contains('Proyecto B').should('be.visible');
  });

  it('permite crear un proyecto', () => {
    cy.intercept('POST', '**/api/proyectos', {
      statusCode: 200,
      body: { success: true, data: { _id: 'p3', nombre: 'Proyecto C', estado: 'activo' } },
    }).as('createProyecto');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Proyecto C');
    cy.get('select[formcontrolname="estado"] option').should('contain.text', 'Activo');
    cy.get('button[type="submit"]').click();
    cy.wait('@createProyecto');
  });

  it('permite ver el detalle de un proyecto', () => {
    cy.contains('Proyecto A').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/proyectos/p1');
    cy.contains('Proyecto A').should('be.visible');
    cy.contains('Activo').should('be.visible');
    cy.contains('Investigadores').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un proyecto', () => {
    cy.intercept('PUT', '**/api/proyectos/p1', {
      statusCode: 200,
      body: { success: true, message: 'Proyecto actualizado' },
    }).as('updateProyecto');

    cy.contains('Proyecto A').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Proyecto A Actualizado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateProyecto');
  });

  it('permite eliminar un proyecto', () => {
    cy.intercept('DELETE', '**/api/proyectos/p2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteProyecto');

    cy.contains('Proyecto B').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteProyecto');
  });
});