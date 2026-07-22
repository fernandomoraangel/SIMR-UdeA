import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MateriasStore } from '../../../state/materias.store';
import { HelpPopupComponent } from '../../../../../shared/help-popup/help-popup.component';
import { CollapsibleSectionComponent } from '../../../../../shared/collapsible-section/collapsible-section.component';
import { ListEditorComponent } from '../../../../../shared/list-editor/list-editor.component';
import { AutocompleteCreateComponent } from '../../../../../shared/autocomplete-create/autocomplete-create.component';
import {
  VinculoRelacionadoEditorComponent,
  VinculoRelacionado,
} from '../../../../../shared/vinculo-relacionado-editor/vinculo-relacionado-editor.component';
import {
  DescriptorLibreEditorComponent,
  DescriptorLibre,
} from '../../../../../shared/descriptor-libre-editor/descriptor-libre-editor.component';
import { PATTERNS } from '../../../../../shared/validators/patterns';
import { ArchivoManagerComponent } from '../../../../archivos/archivo-manager/archivo-manager.component';
import { FileBasicInfo, FileDeleteInfo } from '../../../../archivos/models/archivo.interface';
import { CreateMateriaRequest, UpdateMateriaRequest } from '../../../domain/materia.interface';

@Component({
  selector: 'app-materia-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HelpPopupComponent,
    CollapsibleSectionComponent,
    ListEditorComponent,
    AutocompleteCreateComponent,
    VinculoRelacionadoEditorComponent,
    DescriptorLibreEditorComponent,
    ArchivoManagerComponent,
  ],
  providers: [MateriasStore],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()" aria-label="Volver" class="volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Editar Materia' : 'Nueva Materia' }}</h1>
      </header>

      @if (store.hasError()) {
        <div class="alerta">
          <mat-icon>error_outline</mat-icon>
          <span>{{ store.error() }}</span>
          <button mat-button (click)="store.clearError()">Cerrar</button>
        </div>
      }

      <mat-card class="materia-form" appearance="outlined">
        <form [formGroup]="materiaForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <div class="field-with-help">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Nombre de la Materia</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej: Música clásica, Jazz..." />
                @if (isFieldInvalid('nombre')) {
                  <mat-error>
                    @if (materiaForm.get('nombre')?.errors?.['required']) {
                      El nombre es requerido
                    }
                    @if (materiaForm.get('nombre')?.errors?.['minlength']) {
                      Debe tener al menos 2 caracteres
                    }
                  </mat-error>
                }
              </mat-form-field>
              <app-help-popup tabla="materias" campo="nombre"></app-help-popup>
            </div>

            <div class="field-with-help">
              <mat-form-field appearance="outline" class="campo">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción de la materia..."></textarea>
              </mat-form-field>
              <app-help-popup tabla="materias" campo="descripcion"></app-help-popup>
            </div>
          </div>

          <app-collapsible-section title="Alias" icon="alt_route" [collapsed]="true">
            <app-list-editor
              [value]="aliasItems"
              (valueChange)="onAliasChange($event)"
              placeholder="Ej: Música popular"
              [pattern]="PATTERNS.simpleText"
            ></app-list-editor>
          </app-collapsible-section>

          <app-collapsible-section title="Materias relacionadas" icon="link" [collapsed]="true">
            <app-autocomplete-create
              apiEndpoint="materias"
              placeholder="Buscar materia..."
              [selected]="relacionadasItems"
              (selectedChange)="onRelacionadasChange($event)"
            ></app-autocomplete-create>
          </app-collapsible-section>

          <app-collapsible-section title="Jerarquía" icon="account_tree" [collapsed]="true">
            <div class="jerarquia-desc">
              <p class="jerarquia-ayuda">Define las relaciones jerárquicas de esta materia.</p>
            </div>
            <div class="jerarquia-campos">
              <div class="jerarquia-col">
                <label class="jerarquia-col-label">Padres (términos más generales)</label>
                <app-autocomplete-create
                  apiEndpoint="materias"
                  placeholder="Buscar materia padre..."
                  [selected]="padresItems"
                  (selectedChange)="onPadresChange($event)"
                ></app-autocomplete-create>
              </div>
              <div class="jerarquia-col">
                <label class="jerarquia-col-label">Hijos (términos más específicos)</label>
                <app-autocomplete-create
                  apiEndpoint="materias"
                  placeholder="Buscar materia hija..."
                  [selected]="hijosItems"
                  (selectedChange)="onHijosChange($event)"
                ></app-autocomplete-create>
              </div>
            </div>
          </app-collapsible-section>

          <app-collapsible-section title="Descriptores libres" icon="label" [collapsed]="true">
            <app-descriptor-libre-editor
              [descriptores]="descriptorItems"
              (descriptoresChange)="onDescriptorChange($event)"
            ></app-descriptor-libre-editor>
          </app-collapsible-section>

          <app-collapsible-section title="Vínculos relacionados" icon="language" [collapsed]="true">
            <app-vinculo-relacionado-editor
              [vinculos]="vinculoItems"
              (vinculosChange)="onVinculoChange($event)"
            ></app-vinculo-relacionado-editor>
          </app-collapsible-section>

          <app-collapsible-section title="Archivos adjuntos" icon="attachment" [collapsed]="true">
            <app-archivo-manager
              collection="materias"
              [documentId]="materiaId || ''"
              (fileUploaded)="onFileUploaded($event)"
              (fileDeleted)="onFileDeleted($event)"
            ></app-archivo-manager>
          </app-collapsible-section>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()" [disabled]="store.isLoading()">
              Cancelar
            </button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="materiaForm.invalid || store.isLoading()"
            >
              @if (store.isLoading()) {
                <mat-spinner diameter="18"></mat-spinner>
                Guardando...
              } @else {
                <mat-icon>save</mat-icon>
                {{ isEditMode ? 'Actualizar' : 'Crear' }}
              }
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
    .materia-form { padding: 0; border-radius: 14px !important; border-color: var(--mat-sys-outline) !important; overflow: hidden; }
    .form-section { padding: 2rem 2rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .field-with-help { display: flex; align-items: flex-start; gap: 0.25rem; }
    .field-with-help .campo { flex: 1; }
    .alerta { display: flex; align-items: center; gap: 0.75rem; background: #fbeae6; color: var(--simr-sello-osc); border: 1px solid var(--simr-sello); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding: 1.5rem 2rem; border-top: 1px solid var(--mat-sys-outline); }
    .jerarquia-desc { margin-bottom: 1rem; }
    .jerarquia-ayuda { font-size: 0.88rem; color: var(--simr-tinta-2); margin: 0; }
    .jerarquia-campos { display: flex; flex-direction: column; gap: 1.5rem; }
    .jerarquia-col-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--simr-tinta-2); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
  `],
})
export class MateriaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(MateriasStore);

  materiaForm: FormGroup;
  isEditMode = false;
  materiaId: string | null = null;

  aliasItems: string[] = [];
  relacionadasItems: any[] = [];
  padresItems: any[] = [];
  hijosItems: any[] = [];
  descriptorItems: DescriptorLibre[] = [];
  vinculoItems: VinculoRelacionado[] = [];
  archivosAdjuntosItems: { archivoId: string }[] = [];

  protected readonly PATTERNS = PATTERNS;

  constructor() {
    this.materiaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
    });

    effect(() => {
      const materia = this.store.selectedMateria();
      if (materia) {
        this.materiaForm.patchValue({
          nombre: materia.nombre,
          descripcion: materia.descripcion,
        });
        this.aliasItems = (materia.alias || []).map((a) => a.nombre);
        this.relacionadasItems = (materia.materiasRelacionadas || []).map((r: any) => {
          const id = typeof r.id === 'object' ? r.id._id : r.id;
          const nombre = typeof r.id === 'object' ? r.id.nombre : (r.nombre || r.id);
          return { _id: id, nombre };
        });
        this.padresItems = (materia.padres || []).map((p: any) => {
          const id = typeof p.id === 'object' ? p.id._id : p.id;
          const nombre = typeof p.id === 'object' ? p.id.nombre : (p.nombre || p.id);
          return { _id: id, nombre };
        });
        this.hijosItems = (materia.hijos || []).map((h: any) => {
          const id = typeof h.id === 'object' ? h.id._id : h.id;
          const nombre = typeof h.id === 'object' ? h.id.nombre : (h.nombre || h.id);
          return { _id: id, nombre };
        });
        this.descriptorItems = materia.descriptorLibre || [];
        this.vinculoItems = materia.vinculoRelacionado || [];
        this.archivosAdjuntosItems = (materia.archivosAdjuntos || []).map((a: any) => ({
          archivoId: a.archivoId || a.id || a._id,
        }));
      }
    });
  }

  ngOnInit() {
    this.store.setInitialState();
    this.materiaId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.materiaId;

    if (this.isEditMode && this.materiaId) {
      this.store.loadMateriaById(this.materiaId);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.materiaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onAliasChange(items: string[]) {
    this.aliasItems = items;
  }

  onRelacionadasChange(items: any[]) {
    this.relacionadasItems = items;
  }

  onPadresChange(items: any[]) {
    this.padresItems = items;
  }

  onHijosChange(items: any[]) {
    this.hijosItems = items;
  }

  onDescriptorChange(items: DescriptorLibre[]) {
    this.descriptorItems = items;
  }

  onVinculoChange(items: VinculoRelacionado[]) {
    this.vinculoItems = items;
  }

  onFileUploaded(file: FileBasicInfo) {
    if (!this.archivosAdjuntosItems.find((f) => f.archivoId === file.id)) {
      this.archivosAdjuntosItems = [...this.archivosAdjuntosItems, { archivoId: file.id }];
    }
  }

  onFileDeleted(file: FileDeleteInfo) {
    this.archivosAdjuntosItems = this.archivosAdjuntosItems.filter((f) => f.archivoId !== file.id);
  }

  onSubmit() {
    if (this.materiaForm.valid) {
      const formValue = this.materiaForm.value;
      const data: CreateMateriaRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        alias: this.aliasItems.map((n) => ({ nombre: n })),
        materiasRelacionadas: this.relacionadasItems.map((item) => ({
          id: item._id,
          nombre: item.nombre,
        })),
        padres: this.padresItems.map((item) => ({
          id: item._id,
          nombre: item.nombre,
        })),
        hijos: this.hijosItems.map((item) => ({
          id: item._id,
          nombre: item.nombre,
        })),
        descriptorLibre: this.descriptorItems,
        vinculoRelacionado: this.vinculoItems,
      };

      data.archivosAdjuntos = this.archivosAdjuntosItems;

      if (this.isEditMode && this.materiaId) {
        this.store.updateMateria({ id: this.materiaId, data });
      } else {
        this.store.createMateria(data);
      }
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/materias']);
  }
}
