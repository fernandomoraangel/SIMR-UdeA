describe('Módulo Administración - Roles y Auditoría (Fase 1.4/1.5)', () => {
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
  });

  it('lista roles y muestra jerarquía', () => {
    cy.intercept('GET', '**/api/roles*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'r1', name: 'admin', displayName: 'Administrador', priority: 100, isSystem: true },
          { _id: 'r2', name: 'lector', displayName: 'Lector', priority: 10, isSystem: true },
        ],
      },
    }).as('roles');

    cy.visit('/angular/admin/roles');
    cy.wait('@verify');
    cy.wait('@roles');
    cy.contains('Roles').should('be.visible');
    cy.contains('admin').should('be.visible');
    cy.contains('Sistema').should('be.visible');
  });

  it('muestra la matriz de permisos al editar rol', () => {
    cy.intercept('GET', '**/api/roles*', {
      statusCode: 200,
      body: {
        success: true,
        data: [{ _id: 'r2', name: 'lector', displayName: 'Lector', priority: 10, isSystem: true }],
      },
    }).as('roles');
    cy.intercept('GET', '**/api/roles/resources', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { key: 'user', name: 'Usuarios' },
          { key: 'obra', name: 'Obras' },
        ],
      },
    }).as('resources');
    cy.intercept('GET', '**/api/roles/r2', {
      statusCode: 200,
      body: {
        success: true,
        data: { name: 'lector', displayName: 'Lector', priority: 10, isSystem: true },
      },
    }).as('roleById');

    cy.visit('/angular/admin/roles/r2/editar');
    cy.wait('@verify');
    cy.wait('@resources');
    cy.contains('Permisos directos').should('be.visible');
    cy.contains('Recurso').should('be.visible');
  });

  it('muestra la auditoría del sistema', () => {
    cy.intercept('GET', '**/api/auditlogs*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          logs: [
            { _id: 'a1', action: 'role_created', createdAt: '2024-01-01T10:00:00Z' },
          ],
          pagination: { total: 1, limit: 50, skip: 0, hasMore: false },
        },
      },
    }).as('audit');

    cy.visit('/angular/admin/auditoria');
    cy.wait('@verify');
    cy.wait('@audit');
    cy.contains('Auditoría del Sistema').should('be.visible');
    cy.contains('role_created').should('be.visible');
  });
});
