describe('Gestión de archivos - MinIO (Fase 2)', () => {
  const COLLECTION = 'obras';
  const DOCUMENT_ID = '6461f56c83d5773c89571a05'; // obra real en MongoDB
  const TEST_FILE = 'cypress-test-file.txt';

  beforeEach(() => {
    cy.intercept('GET', '**/api/auth/verify', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            _id: '63cf964b67efb2c799e16db5',
            username: 'fernando.mora',
            firstName: 'Fernando',
            lastName: 'Mora',
            roles: [{ name: 'admin' }],
          },
        },
      },
    }).as('verify');

    cy.intercept('GET', '**/files/document-files*', {
      statusCode: 200,
      body: [],
    }).as('docFiles');

    cy.visit('/angular/archivos/manager');
    cy.wait('@verify');
  });

  it('muestra el componente de gestión de archivos', () => {
    cy.get('.archivo-manager').should('exist');
    cy.contains('No hay archivos disponibles').should('be.visible');
  });

  it('permite seleccionar un archivo para subir', () => {
    cy.get('input[type="file"]').should('exist');
    cy.get('button').contains('Subir').should('be.disabled');
  });

  it('realiza upload, listado y delete contra MinIO real', () => {
    // Intercepts para el flujo completo
    cy.intercept('POST', '**/files/upload', (req) => {
      // Simular respuesta exitosa de upload
      req.reply({
        statusCode: 200,
        body: {
          message: 'Archivo subido con éxito',
          fileData: {
            filename: TEST_FILE,
            originalName: TEST_FILE,
            mimetype: 'text/plain',
            size: 25,
            uploadDate: new Date().toISOString(),
            minioObjectName: TEST_FILE,
          },
          documentId: 'mock-archivo-id',
        },
      });
    }).as('upload');

    cy.intercept('GET', '**/files/document-files*', {
      statusCode: 200,
      body: [
        {
          name: TEST_FILE,
          size: 25,
          lastModified: new Date().toISOString(),
          id: 'mock-archivo-id',
        },
      ],
    }).as('docFilesAfterUpload');

    // Seleccionar archivo
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('contenido de prueba e2e'), fileName: TEST_FILE },
      { force: true }
    );

    // Verificar que aparece el nombre del archivo seleccionado
    cy.contains(TEST_FILE).should('be.visible');

    // Subir
    cy.get('button').contains('Subir').click();
    cy.wait('@upload');

    // Verificar que el SweetAlert de éxito aparece
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').contains('Éxito');
    cy.get('.swal2-confirm').click();

    // Verificar que el archivo aparece en la tabla
    cy.get('table').should('exist');
    cy.contains(TEST_FILE).should('be.visible');

    // Seleccionar y eliminar
    cy.intercept('DELETE', '**/files/' + TEST_FILE, {
      statusCode: 200,
      body: { message: 'Archivo eliminado con éxito' },
    }).as('deleteFile');

    cy.intercept('GET', '**/files/document-files*', {
      statusCode: 200,
      body: [],
    }).as('docFilesAfterDelete');

    cy.get('mat-checkbox').first().click();
    cy.get('button').contains('Eliminar seleccionados').click();

    // Confirmar eliminación en SweetAlert
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-confirm').click();
    cy.wait('@deleteFile');

    // Verificar éxito
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').contains('Éxito');
    cy.get('.swal2-confirm').click();

    // Verificar que la tabla vuelve a estar vacía
    cy.contains('No hay archivos disponibles').should('be.visible');
  });
});
