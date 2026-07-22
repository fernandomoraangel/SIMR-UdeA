import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@env/environment';
import { IdiomasStore } from '../../../state/idiomas.store';
import { IdiomasService } from '../../../data/idiomas.service';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { HelpPopupComponent } from '../../../../../shared/help-popup/help-popup.component';
import { AnotacionesCartograficasComponent } from '../../../../../shared/anotaciones-cartograficas/anotaciones-cartograficas.component';
import { AnotacionCartograficoTemporal } from '../../../../../shared/anotaciones-cartograficas/models/anotacion-cartografica.interface';
import { DescriptorLibreEditorComponent, DescriptorLibre } from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { VinculoRelacionadoEditorComponent, VinculoRelacionado } from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';

@Component({
  selector: 'app-idioma-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    CollapsibleSectionComponent,
    HelpPopupComponent,
    AnotacionesCartograficasComponent,
    DescriptorLibreEditorComponent,
    VinculoRelacionadoEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [IdiomasStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Idioma' : 'Nuevo Idioma' }}</h1>
      </header>

      @if (store.isLoading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
      }

      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }

      <mat-card class="idioma-form" appearance="outlined">
        <form [formGroup]="idiomaForm" (ngSubmit)="onSubmit()">

          <app-collapsible-section title="Identificación" icon="badge">
            <div class="section-content">
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Idioma (exónimo español) *</mat-label>
                  <input matInput formControlName="idioma" placeholder="Ej: Wayúu, Quechua, Guaraní" />
                  @if (isFieldInvalid('idioma')) {
                    <mat-error>El idioma es obligatorio</mat-error>
                  }
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="exonymSpanish" />
              </div>
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Endónimo (autodenominación)</mat-label>
                  <input matInput formControlName="endonym" placeholder="Ej: Wayuunaiki, Runa Simi" />
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="endonym" />
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Clasificación lingüística" icon="category">
            <div class="section-content">
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Familia lingüística</mat-label>
                  <input matInput formControlName="linguisticFamily" [matAutocomplete]="familiaAuto" placeholder="Buscar familia…" />
                  <mat-autocomplete #familiaAuto="matAutocomplete">
                    @for (f of filteredFamilias(); track f) {
                      <mat-option [value]="f">{{ f }}</mat-option>
                    }
                    @if (filteredFamilias().length === 0 && idiomaForm.get('linguisticFamily')?.value?.trim()) {
                      <mat-option disabled><span class="no-result">Sin resultados</span></mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="linguisticFamily" />
              </div>
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Modo de transmisión</mat-label>
                  <input matInput formControlName="transmissionMode" [matAutocomplete]="modoAuto" placeholder="Buscar modo…" />
                  <mat-autocomplete #modoAuto="matAutocomplete">
                    @for (m of filteredModos(); track m) {
                      <mat-option [value]="m">{{ m }}</mat-option>
                    }
                    @if (filteredModos().length === 0 && idiomaForm.get('transmissionMode')?.value?.trim()) {
                      <mat-option disabled><span class="no-result">Sin resultados</span></mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="transmissionMode" />
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Códigos y estándares" icon="code">
            <div class="section-content">
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Glottocode</mat-label>
                  <input matInput formControlName="glottocode" placeholder="Ej: wayu1243" />
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="glottocode" />
              </div>
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Código ISO 639-3</mat-label>
                  <input matInput formControlName="isoCode" placeholder="Ej: guc" />
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="isoCode" />
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Contexto territorial" icon="map">
            <div class="section-content">
              <div class="field-with-help">
                <mat-form-field appearance="outline" class="campo">
                  <mat-label>Contexto territorial</mat-label>
                  <textarea matInput formControlName="territorialContext" rows="2" placeholder="Ej: Sierra Nevada de Santa Marta, Cuenca del Amazonas, Gran Chaco"></textarea>
                </mat-form-field>
                <app-help-popup tabla="idiomas" campo="territorialContext" />
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Anotaciones cartográfico-temporales" icon="map" [collapsed]="true">
            <div class="section-content">
              <app-anotaciones-cartograficas
                [anotaciones]="anotacionesItems"
                [lugares]="lugares()"
                [coberturas]="coberturas()"
                (anotacionesChange)="anotacionesItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Descriptores libres" icon="label" [collapsed]="true">
            <div class="section-content">
              <app-descriptor-libre-editor
                [descriptores]="descriptorItems"
                (descriptoresChange)="descriptorItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Enlaces" icon="link" [collapsed]="true">
            <div class="section-content">
              <app-vinculo-relacionado-editor
                [vinculos]="vinculoItems"
                (vinculosChange)="vinculoItems = $event"
              />
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attach_file" [collapsed]="true">
            <div class="section-content">
              <app-archivo-manager
                [documentId]="documentId()"
                collection="idiomas"
                (fileUploaded)="onFileUploaded($event)"
                (fileDeleted)="onFileDeleted($event)"
              />
            </div>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="idiomaForm.invalid || store.isLoading()">
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
    .form-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .form-header h1 { margin: 0; }
    .volver { color: var(--simr-musgo); }
    .loading-bar { margin-bottom: 1rem; }
    .idioma-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .section-content { padding: 0.5rem 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .field-with-help { display: flex; align-items: flex-start; gap: 0.25rem; }
    .field-with-help .campo { flex: 1; }
    .campo { min-width: 0; }
    .no-result { font-size: 0.82rem; color: var(--simr-tinta-2); cursor: default; pointer-events: none; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    @media (max-width: 600px) {
      .form-container { padding: 0 1rem; }
      .form-actions { padding: 1.5rem 1rem; }
    }
  `],
})
export class IdiomaFormComponent implements OnInit {
  protected readonly store = inject(IdiomasStore);
  private readonly idiomasService = inject(IdiomasService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected isEditMode = false;
  protected idiomaId: string | null = null;

  protected familias = signal<string[]>([]);
  protected modos = signal<string[]>([]);
  protected filteredFamilias = signal<string[]>([]);
  protected filteredModos = signal<string[]>([]);
  protected lugares = signal<string[]>([]);
  protected coberturas = signal<string[]>([]);
  protected documentId = signal<string>('');

  protected anotacionesItems: AnotacionCartograficoTemporal[] = [];
  protected descriptorItems: DescriptorLibre[] = [];
  protected vinculoItems: VinculoRelacionado[] = [];
  protected archivosAdjuntosItems: { archivoId: string }[] = [];

  idiomaForm: FormGroup = this.fb.group({
    idioma: ['', Validators.required],
    glottocode: [''],
    isoCode: [''],
    endonym: [''],
    exonymSpanish: [''],
    linguisticFamily: [''],
    transmissionMode: [''],
    territorialContext: [''],
  });

  constructor() {
    effect(() => {
      const idioma = this.store.selectedIdioma();
      if (idioma && this.isEditMode) {
        this.loadIdiomaData(idioma);
      }
    });

    this.idiomaForm.get('linguisticFamily')?.valueChanges.subscribe((val) => {
      const term = (val || '').toLowerCase().trim();
      this.filteredFamilias.set(
        this.familias().filter((f) => f.toLowerCase().includes(term))
      );
    });

    this.idiomaForm.get('transmissionMode')?.valueChanges.subscribe((val) => {
      const term = (val || '').toLowerCase().trim();
      this.filteredModos.set(
        this.modos().filter((m) => m.toLowerCase().includes(term))
      );
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.idiomaId = id;
        this.documentId.set(id);
        this.store.setInitialState();
        this.store.loadIdiomaById(id);
        this.http.get(`${environment.apiUrl}/idiomas/${id}`).subscribe({
          next: (idioma: any) => this.loadIdiomaData(idioma),
          error: (err) => console.error('[IdiomaForm] error al cargar', err),
        });
      }
    });
  }

  private loadReferenceData() {
    const apiUrl = environment.apiUrl;
    this.http.get(`${apiUrl}/listas/familiasLinguisticas`).subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.elementos || data?.data?.elementos || [];
        this.familias.set(arr);
        this.filteredFamilias.set(arr);
      },
      error: () => this.familias.set([]),
    });
    this.http.get(`${apiUrl}/listas/modosDeTransmision`).subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.elementos || data?.data?.elementos || [];
        this.modos.set(arr);
        this.filteredModos.set(arr);
      },
      error: () => this.modos.set([]),
    });
    this.http.get(`${apiUrl}/listas/lugares`).subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.elementos || data?.data?.elementos || [];
        this.lugares.set(arr);
      },
      error: () => this.lugares.set([]),
    });
    this.http.get(`${apiUrl}/listas/coberturas`).subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.elementos || data?.data?.elementos || [];
        this.coberturas.set(arr);
      },
      error: () => this.coberturas.set([]),
    });
  }

  private loadIdiomaData(idioma: any) {
    this.idiomaForm.patchValue({
      idioma: idioma.idioma || '',
      glottocode: idioma.glottocode || '',
      isoCode: idioma.isoCode || '',
      endonym: idioma.endonym || '',
      exonymSpanish: idioma.exonymSpanish || '',
      linguisticFamily: idioma.linguisticFamily || '',
      transmissionMode: idioma.transmissionMode || '',
      territorialContext: idioma.territorialContext || '',
    });
    this.anotacionesItems = idioma.anotacionCartograficoTemporal || [];
    this.descriptorItems = idioma.descriptorLibre || [];
    this.vinculoItems = idioma.vinculoRelacionado || [];
    this.archivosAdjuntosItems = (idioma.archivosAdjuntos || []).map((a: any) => ({
      archivoId: a.archivoId || a.id || a._id,
    }));
  }

  protected isFieldInvalid(field: string): boolean {
    const control = this.idiomaForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onFileUploaded(file: FileBasicInfo) {
    if (!this.archivosAdjuntosItems.find((f) => f.archivoId === file.id)) {
      this.archivosAdjuntosItems = [...this.archivosAdjuntosItems, { archivoId: file.id }];
    }
  }

  protected onFileDeleted(file: FileDeleteInfo) {
    this.archivosAdjuntosItems = this.archivosAdjuntosItems.filter((f) => f.archivoId !== file.id);
  }

  protected onSubmit() {
    if (this.idiomaForm.invalid) return;

    const payload: any = {
      idioma: this.idiomaForm.value.idioma,
      glottocode: this.idiomaForm.value.glottocode || '',
      isoCode: this.idiomaForm.value.isoCode || '',
      endonym: this.idiomaForm.value.endonym || '',
      exonymSpanish: this.idiomaForm.value.exonymSpanish || '',
      linguisticFamily: this.idiomaForm.value.linguisticFamily || '',
      transmissionMode: this.idiomaForm.value.transmissionMode || '',
      territorialContext: this.idiomaForm.value.territorialContext || '',
      anotacionCartograficoTemporal: this.anotacionesItems,
      descriptorLibre: this.descriptorItems,
      vinculoRelacionado: this.vinculoItems,
      archivosAdjuntos: this.archivosAdjuntosItems,
    };

    if (this.isEditMode && this.idiomaId) {
      this.idiomasService.update(this.idiomaId, payload).subscribe({
        next: () => this.router.navigate(['/idiomas', this.idiomaId]),
        error: (err) => {
          this.store.setError(err?.error?.message || 'Error al actualizar el idioma');
        },
      });
    } else {
      this.idiomasService.create(payload).subscribe({
        next: () => this.router.navigate(['/idiomas']),
        error: (err) => {
          this.store.setError(err?.error?.message || 'Error al crear el idioma');
        },
      });
    }
  }

  protected goBack() {
    this.router.navigate(['/idiomas']);
  }
}
