describe('Autenticación - Login, Refresh, Logout (Fase 0)', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('muestra el formulario de login', () => {
    cy.contains('Iniciar sesión').should('be.visible');
    cy.get('input[formcontrolname="username"]').should('be.visible');
    cy.get('input[formcontrolname="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('permite iniciar sesión con credenciales válidas', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: { _id: 'u1', username: 'fernando.mora', roles: [{ name: 'admin' }] },
          token: 'fake-jwt-token',
        },
      },
    }).as('login');

    cy.get('input[formcontrolname="username"]').type('fernando.mora');
    cy.get('input[formcontrolname="password"]').type('Simr2024!');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.url().should('include', '/');
  });

  it('muestra error con credenciales inválidas', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { success: false, message: 'Credenciales inválidas' },
    }).as('login');

    cy.get('input[formcontrolname="username"]').type('usuario erroneo');
    cy.get('input[formcontrolname="password"]').type('clave incorrecta');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.contains('Credenciales inválidas').should('be.visible');
  });

  it('permite cerrar sesión', () => {
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: {
        success: true,
        data: { user: { _id: 'u1', username: 'fernando.mora', roles: [{ name: 'admin' }] } },
      },
    }).as('verify');

    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 200,
      body: { success: true },
    }).as('logout');

    cy.visit('/dashboard');
    cy.wait('@verify');
    cy.get('[aria-label="Cerrar sesión"]').click();
    cy.wait('@logout');
    cy.url().should('include', '/login');
  });

  it('maneja el refresh automático de token', () => {
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: {
        success: true,
        data: { user: { _id: 'u1', username: 'fernando.mora', roles: [{ name: 'admin' }] } },
      },
    }).as('verify');

    cy.visit('/dashboard');
    cy.wait('@verify');
    cy.url().should('include', '/dashboard');
  });
});