describe('Módulo Diccionarios - Gestión (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/diccionarios', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'd1', tabla: 'Instrumentos', campo: 'nombre', campoLargo: 'string', definicion: 'Nombre del instrumento' },
          { _id: 'd2', tabla: 'Generos', campo: 'nombre', campoLargo: 'string', definicion: 'Nombre del género' },
        ],
      },
    }).as('diccionarios');

    cy.visit('/diccionarios');
    cy.wait('@verify');
    cy.wait('@diccionarios');
  });

  it('muestra la lista de diccionarios', () => {
    cy.contains('Diccionarios').should('be.visible');
    cy.contains('Instrumentos').should('be.visible');
    cy.contains('Generos').should('be.visible');
  });

  it('permite crear un diccionario', () => {
    cy.intercept('POST', '**/api/diccionarios', {
      statusCode: 200,
      body: { success: true, data: { _id: 'd3', tabla: 'Materias', campo: 'nombre', campoLargo: 'string', definicion: 'Nombre de la materia' } },
    }).as('createDiccionario');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="tabla"]').type('Materias');
    cy.get('input[formcontrolname="campo"]').type('nombre');
    cy.get('textarea[formcontrolname="definicion"]').type('Nombre de la materia');
    cy.get('button[type="submit"]').click();
    cy.wait('@createDiccionario');
  });

  it('permite ver el detalle de un diccionario', () => {
    cy.contains('Instrumentos').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/diccionarios/d1');
    cy.contains('Instrumentos').should('be.visible');
    cy.contains('Nombre del instrumento').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un diccionario', () => {
    cy.intercept('PUT', '**/api/diccionarios/d1', {
      statusCode: 200,
      body: { success: true, message: 'Diccionario actualizado' },
    }).as('updateDiccionario');

    cy.contains('Instrumentos').parent().find('button[aria-label="Editar"]').click();
    cy.get('textarea[formcontrolname="definicion"]').clear().type('Nombre del instrumento musical');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateDiccionario');
  });

  it('permite eliminar un diccionario', () => {
    cy.intercept('DELETE', '**/api/diccionarios/d2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteDiccionario');

    cy.contains('Generos').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteDiccionario');
  });
});