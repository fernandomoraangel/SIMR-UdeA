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
    cy.intercept('PUT', '**/api/users/u3/roles', { statusCode: 200, body: { success: true } }).as('userRoles');

    cy.contains('Crear usuario').click();
    cy.get('input[formcontrolname="username"]').type('nuevo');
    cy.get('input[formcontrolname="firstName"]').type('Nuevo');
    cy.get('input[formcontrolname="lastName"]').type('Usuario');
    cy.get('input[formcontrolname="email"]').type('nuevo@udea.edu.co');
    cy.get('input[formcontrolname="password"]').type('Simr2024!');
    cy.get('button[type="submit"]').click();
    cy.wait('@signup');
    cy.wait('@userRoles');
  });

  it('elimina un usuario con confirmación', () => {
    cy.intercept('DELETE', '**/api/users/u2', { statusCode: 200, body: { success: true } }).as('del');
    cy.contains('lector1').parent().find('button[color="warn"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@del');
  });

  describe('Roles', () => {
    beforeEach(() => {
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
          data: {
            _id: 'r2',
            name: 'lector',
            displayName: 'Lector',
            priority: 10,
            isSystem: true,
            permissions: { obras: { read: ['any'] }, users: { read: ['any'] } },
          },
        },
      }).as('roleById');

      cy.visit('/angular/admin/roles');
      cy.wait('@verify');
      cy.wait('@roles');
    });

    it('el enlace de edición usa el id real (no undefined)', () => {
      cy.contains('Lector').parent().find('a[aria-label="Editar"]').should('have.attr', 'href').and('include', '/r2/editar');
      cy.contains('Lector').parent().find('a[aria-label="Editar"]').should('have.attr', 'href').and('not.include', 'undefined');
    });

    it('al editar carga los datos del rol y sus permisos', () => {
      cy.contains('Lector').parent().find('a[aria-label="Editar"]').click();
      cy.url().should('include', '/admin/roles/r2/editar');
      cy.wait('@roleById');
      cy.get('input[formcontrolname="displayName"]').should('have.value', 'Lector');
      cy.get('input[formcontrolname="priority"]').should('have.value', '10');
      cy.get('button.scope-btn.active').should('have.length.at.least', 1);
    });

    it('guarda los cambios de permisos del rol', () => {
      cy.intercept('PUT', '**/api/roles/r2', (req) => {
        req.reply({ statusCode: 200, body: { success: true, message: 'Rol actualizado exitosamente' } });
      }).as('saveRole');
      cy.contains('Lector').parent().find('a[aria-label="Editar"]').click();
      cy.wait('@roleById');
      // Marcar create en Obras (fila "obra")
      cy.contains('obra').parent().find('button.scope-btn').contains('any').click();
      cy.contains('Guardar cambios').click();
      cy.wait('@saveRole').its('request.body').should('have.property', 'permissions');
      cy.url().should('include', '/admin/roles');
    });

    it('abre el detalle del rol', () => {
      cy.contains('Lector').parent().find('button[aria-label="Ver detalles"]').click();
      cy.contains('Lector').should('be.visible');
      cy.contains('Permisos').should('be.visible');
      cy.contains('Cerrar').click();
    });
  });

  describe('Edición de usuario - roles', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/users/u2', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            _id: 'u2',
            username: 'lector1',
            firstName: 'Lector',
            lastName: 'Uno',
            email: 'l@udea.edu.co',
            provider: 'local',
            roles: [{ _id: 'r2', name: 'lector', displayName: 'Lector' }],
          },
        },
      }).as('userById');
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
      cy.intercept('GET', '**/api/roles/resources', {
        statusCode: 200,
        body: { success: true, data: [{ key: 'user', name: 'Usuarios' }, { key: 'obra', name: 'Obras' }] },
      }).as('resources');
      cy.intercept('PUT', '**/api/users/u2', {
        statusCode: 200,
        body: { success: true, message: 'Usuario actualizado exitosamente' },
      }).as('saveUser');
      cy.intercept('PUT', '**/api/users/u2/roles', (req) => {
        req.reply({ statusCode: 200, body: { success: true, message: 'Roles actualizados' } });
      }).as('saveUserRoles');

      cy.visit('/angular/admin/usuarios/u2/editar');
      cy.wait('@verify');
      cy.wait('@userById');
      cy.wait('@roles');
    });

    it('carga los roles asignados al editar', () => {
      cy.get('input[formcontrolname="username"]').should('have.value', 'lector1');
      cy.contains('Lector').should('exist');
    });

    it('guarda los roles asignados al usuario', () => {
      // Marcar el rol admin además del lector
      cy.contains('Administrador').parent().find('mat-checkbox').click();
      cy.contains('Guardar cambios').click();
      cy.wait('@saveUser');
      cy.wait('@saveUserRoles').its('request.body').should('deep.equal', {
        roles: ['r1', 'r2'],
      });
      cy.url().should('include', '/admin/usuarios');
    });

    it('abre el detalle del usuario', () => {
      cy.visit('/angular/admin/usuarios');
      cy.wait('@verify');
      cy.wait('@users');
      cy.contains('lector1').parent().find('button[aria-label="Ver detalles"]').click();
      cy.contains('lector1').should('be.visible');
      cy.contains('Roles asignados').should('be.visible');
      cy.contains('Cerrar').click();
    });
  });
});
