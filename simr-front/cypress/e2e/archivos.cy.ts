describe('Módulo Archivos - Gestión MinIO (Fase 2)', () => {
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

    cy.intercept('GET', '**/api/files/document-files?documentId=test-doc', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'f1', nombre: 'documento.pdf', tipo: 'application/pdf', tamano: 1024000, url: '/files/download/f1.pdf' },
          { _id: 'f2', nombre: 'audio.mp3', tipo: 'audio/mpeg', tamano: 5120000, url: '/files/download/f2.mp3' },
        ],
      },
    }).as('files');

    cy.visit('/archivos');
    cy.wait('@verify');
    cy.wait('@files');
  });

  it('muestra la lista de archivos', () => {
    cy.contains('documento.pdf').should('be.visible');
    cy.contains('audio.mp3').should('be.visible');
  });

  it('permite descargar un archivo', () => {
    cy.intercept('GET', '**/api/files/download/f1.pdf', {
      statusCode: 200,
      body: 'PDF content',
      headers: { 'content-type': 'application/pdf' },
    }).as('download');

    cy.contains('documento.pdf').parent().find('button[aria-label="Descargar"]').click();
    cy.wait('@download');
  });

  it('permite eliminar un archivo', () => {
    cy.intercept('DELETE', '**/api/files/f1', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteFile');

    cy.contains('documento.pdf').parent().find('button[aria-label="Eliminar"]').click();
    cy.contains('Confirmar').click();
    cy.wait('@deleteFile');
  });
});