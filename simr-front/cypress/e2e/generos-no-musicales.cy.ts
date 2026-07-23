describe('Módulo Géneros no musicales - Gestión (Fase 3.A)', () => {
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

    cy.intercept('GET', '**/api/generos-no-musicales', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'gm1', nombre: 'Fondo documental', tipo: 'documental' },
          { _id: 'gm2', nombre: 'Entrevista', tipo: 'interactivo' },
        ],
      },
    }).as('generosNoMusicales');

    cy.visit('/generos-no-musicales');
    cy.wait('@verify');
    cy.wait('@generosNoMusicales');
  });

  it('muestra la lista de géneros no musicales', () => {
    cy.contains('Géneros no musicales').should('be.visible');
    cy.contains('Fondo documental').should('be.visible');
    cy.contains('Entrevista').should('be.visible');
  });

  it('permite crear un género no musical', () => {
    cy.intercept('POST', '**/api/generos-no-musicales', {
      statusCode: 200,
      body: { success: true, data: { _id: 'gm3', nombre: 'Workshop', tipo: 'educativo' } },
    }).as('createGeneroNoMusical');

    cy.contains('Nuevo').click();
    cy.get('input[formcontrolname="nombre"]').type('Workshop');
    cy.get('select[formcontrolname="tipo"] option').should('contain.text', 'Educativo');
    cy.get('button[type="submit"]').click();
    cy.wait('@createGeneroNoMusical');
  });

  it('permite ver el detalle de un género no musical', () => {
    cy.contains('Fondo documental').parent().find('button[aria-label="Ver detalle"]').click();
    cy.url().should('include', '/generos-no-musicales/gm1');
    cy.contains('Fondo documental').should('be.visible');
    cy.contains('Cerrar').click();
  });

  it('permite editar un género no musical', () => {
    cy.intercept('PUT', '**/api/generos-no-musicales/gm1', {
      statusCode: 200,
      body: { success: true, message: 'Género actualizado' },
    }).as('updateGeneroNoMusical');

    cy.contains('Fondo documental').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[formcontrolname="nombre"]').clear().type('Fondo Documental Actualizado');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateGeneroNoMusical');
  });

  it('permite eliminar un género no musical', () => {
    cy.intercept('DELETE', '**/api/generos-no-musicales/gm2', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteGeneroNoMusical');

    cy.contains('Entrevista').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteGeneroNoMusical');
  });
});