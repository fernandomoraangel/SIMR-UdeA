describe('Módulo Administración - Usuarios (Fase 1.4)', () => {
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

    cy.intercept('GET', '**/api/users', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'u1', username: 'fernando.mora', firstName: 'Fernando', lastName: 'Mora', email: 'f@udea.edu.co', provider: 'local', roles: [{ name: 'admin' }] },
          { _id: 'u2', username: 'lector1', firstName: 'Lector', lastName: 'Uno', email: 'l@udea.edu.co', provider: 'local', roles: [{ name: 'lector' }] },
        ],
      },
    }).as('users');

    cy.visit('/angular/admin/usuarios');
    cy.wait('@verify');
    cy.wait('@users');
  });

  it('muestra la lista de usuarios', () => {
    cy.contains('Usuarios').should('be.visible');
    cy.contains('fernando.mora').should('be.visible');
    cy.contains('lector1').should('be.visible');
  });

  it('permite crear un usuario', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 200,
      body: { success: true, data: { user: { _id: 'u3', username: 'nuevo' } } },
    }).as('signup');
    cy.intercept('PUT', '**/api/users/u3/roles', { statusCode: 200, body: { success: true } }).as('roles');

    cy.contains('Crear usuario').click();
    cy.get('input[formcontrolname="username"]').type('nuevo');
    cy.get('input[formcontrolname="firstName"]').type('Nuevo');
    cy.get('input[formcontrolname="lastName"]').type('Usuario');
    cy.get('input[formcontrolname="email"]').type('nuevo@udea.edu.co');
    cy.get('input[formcontrolname="password"]').type('Simr2024!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
  });

  it('elimina un usuario con confirmación', () => {
    cy.intercept('DELETE', '**/api/users/u2', { statusCode: 200, body: { success: true } }).as('del');
    cy.contains('lector1').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@del');
  });
});
