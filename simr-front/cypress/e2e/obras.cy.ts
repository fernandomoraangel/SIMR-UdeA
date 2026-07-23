describe('Módulo Obras - Gestión compleja con múltiples relaciones (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/obras', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'o1',
            titulo: 'Obra 1',
            fecha: '2023-01-15',
            estado: 'completada',
            genero: { _id: 'g1', nombre: 'Clásico' },
            generoNoMusical: null,
            instrumento: { _id: 'i1', nombre: 'Piano' },
            medio: { _id: 'd1', nombre: 'CD' },
            sistema: { _id: 's1', nombre: 'Sistema A' },
            idioma: { _id: 'l1', nombre: 'Español' },
            recursos: [{ _id: 'r1', nombre: 'Recurso 1' }],
            proyecto: { _id: 'p1', nombre: 'Proyecto A' },
            actores: [],
            descripcion: 'Descripción de la obra 1',
          },
        ],
      },
    }).as('obras');

    cy.visit('/obras');
    cy.wait('@verify');
    cy.wait('@obras');
  });

  it('muestra la lista de obras', () => {
    cy.contains('Obras').should('be.visible');
    cy.contains('Obra 1').should('be.visible');
  });

  it('permite crear una obra', () => {
    cy.intercept('POST', '**/api/obras', {
      statusCode: 200,
      body: { success: true, data: { _id: 'o2', titulo: 'Obra 2', fecha: '2023-03-01', estado: 'borrador' } },
    }).as('createObra');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="titulo"]').type('Obra 2');
    cy.get('input[formcontrolname="fecha"]').type('2023-03-01');
    cy.get('select[formcontrolname="estado"] option').should('contain.text', 'Borrador');
    cy.get('button[type="submit"]').click();
    cy.wait('@createObra');
  });

  it('permite ver el detalle de una obra', () => {
    cy.contains('Obra 1').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/obras/o1');
    cy.contains('Obra 1').should('be.visible');
    cy.contains('Descripción de la obra 1').should('be.visible');
    cy.contains('Clásico').should('be.visible');
    cy.contains('Piano').should('be.visible');
    cy.contains('CD').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar una obra', () => {
    cy.intercept('PUT', '**/api/obras/o1', {
      statusCode: 200,
      body: { success: true, message: 'Obra actualizada' },
    }).as('updateObra');

    cy.contains('Obra 1').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="titulo"]').clear().type('Obra 1 Actualizada');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateObra');
  });

  it('permite eliminar una obra', () => {
    cy.intercept('DELETE', '**/api/obras/o1', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteObra');

    cy.contains('Obra 1').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteObra');
  });
});