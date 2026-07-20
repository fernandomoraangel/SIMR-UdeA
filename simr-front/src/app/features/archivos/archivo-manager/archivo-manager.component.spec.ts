import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ArchivoManagerComponent } from './archivo-manager.component';
import { ArchivosService } from '../archivos.service';
import { FileBasicInfo } from '../models/archivo.interface';
import Swal from 'sweetalert2';

describe('ArchivoManagerComponent', () => {
  let component: ArchivoManagerComponent;
  let fixture: ComponentFixture<ArchivoManagerComponent>;
  let archivosServiceSpy: jasmine.SpyObj<ArchivosService>;

  const sampleFiles: FileBasicInfo[] = [
    { id: '1', name: 'doc.pdf', size: 1024, lastModified: new Date() },
    { id: '2', name: 'foto.png', size: 2048, lastModified: new Date() },
  ];

  beforeEach(async () => {
    archivosServiceSpy = jasmine.createSpyObj('ArchivosService', [
      'getDocumentFiles',
      'uploadFile',
      'deleteFile',
      'deleteMultipleFiles',
      'downloadFile',
    ]);

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

    await TestBed.configureTestingModule({
      imports: [ArchivoManagerComponent],
      providers: [
        { provide: ArchivosService, useValue: archivosServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivoManagerComponent);
    component = fixture.componentInstance;
    component.collection = 'obras';
    component.documentId = 'abc123';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load document files on init when collection and documentId are set', () => {
    archivosServiceSpy.getDocumentFiles.and.returnValue(of(sampleFiles));
    fixture.detectChanges();
    expect(archivosServiceSpy.getDocumentFiles).toHaveBeenCalledWith('obras', 'abc123');
    expect(component.files.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should not call getDocumentFiles when ids are missing', () => {
    component.collection = '';
    component.documentId = '';
    fixture.detectChanges();
    expect(archivosServiceSpy.getDocumentFiles).not.toHaveBeenCalled();
    expect(component.files.length).toBe(0);
  });

  it('should reload files when documentId input changes', () => {
    archivosServiceSpy.getDocumentFiles.and.returnValue(of(sampleFiles));
    fixture.detectChanges();
    archivosServiceSpy.getDocumentFiles.calls.reset();
    component.documentId = 'xyz789';
    component.ngOnChanges({
      documentId: {
        currentValue: 'xyz789',
        previousValue: 'abc123',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(archivosServiceSpy.getDocumentFiles).toHaveBeenCalledWith('obras', 'xyz789');
  });

  it('should select and deselect all files', () => {
    component.files = sampleFiles;
    component.toggleAllSelection();
    expect(component.selectedFiles.length).toBe(2);
    expect(component.allSelected).toBeTrue();
    component.toggleAllSelection();
    expect(component.selectedFiles.length).toBe(0);
    expect(component.allSelected).toBeFalse();
  });

  it('should toggle a single file selection', () => {
    component.files = sampleFiles;
    component.toggleFileSelection(sampleFiles[0]);
    expect(component.isInSelectedFiles('1')).toBeTrue();
    component.toggleFileSelection(sampleFiles[0]);
    expect(component.isInSelectedFiles('1')).toBeFalse();
  });

  it('should upload a file and emit fileUploaded', () => {
    const fakeFile = new File(['x'], 'test.txt', { type: 'text/plain' });
    component.selectedFile = fakeFile;
    const emitSpy = spyOn(component.fileUploaded, 'emit');
    archivosServiceSpy.uploadFile.and.returnValue(
      of({ type: 'response', body: { documentId: '99', fileData: { minioObjectName: 'test.txt', size: 4, uploadDate: '2026-01-01' } } })
    );
    archivosServiceSpy.getDocumentFiles.and.returnValue(of([]));

    component.uploadFile();

    expect(archivosServiceSpy.uploadFile).toHaveBeenCalledWith(fakeFile);
    expect(emitSpy).toHaveBeenCalled();
    expect(component.selectedFile).toBeNull();
  });

  it('should not upload when no file is selected', () => {
    component.selectedFile = null;
    component.uploadFile();
    expect(archivosServiceSpy.uploadFile).not.toHaveBeenCalled();
  });

  it('should delete a single file and reload', () => {
    archivosServiceSpy.deleteFile.and.returnValue(of({ message: 'ok' }));
    archivosServiceSpy.getDocumentFiles.and.returnValue(of([]));
    const emitSpy = spyOn(component.fileDeleted, 'emit');

    component.collection = 'obras';
    component.documentId = 'abc123';
    component.deleteFile(sampleFiles[0]);

    // SweetAlert confirm is stubbed via window; simulate by calling the service path directly
    expect(archivosServiceSpy.deleteFile).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should handle upload error without throwing', () => {
    component.selectedFile = new File(['x'], 'test.txt');
    archivosServiceSpy.uploadFile.and.returnValue(throwError(() => new Error('boom')));
    expect(() => component.uploadFile()).not.toThrow();
    expect(component.uploading).toBeFalse();
  });

  it('should format bytes', () => {
    expect(component.formatBytes(0)).toBe('0 Bytes');
    expect(component.formatBytes(1024)).toBe('1 KB');
    expect(component.formatBytes(1048576)).toBe('1 MB');
  });
});
