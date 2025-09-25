import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Diccionario,
  CreateDiccionarioDto,
} from '../../models/diccionario.interface';

@Component({
  selector: 'app-diccionario-form',
  templateUrl: './diccionario-form.component.html',
  styleUrls: ['./diccionario-form.component.css'],
})
export class DiccionarioFormComponent implements OnInit, OnChanges {
  @Input() diccionario: Diccionario | null = null;
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateDiccionarioDto>();
  @Output() formCancel = new EventEmitter<void>();

  // protected diccionarioForm!: FormGroup;
  // protected isEditMode = false;
  // public diccionarioForm!: FormGroup;
  
  public isEditMode = false;

  constructor(private fb: FormBuilder) {
    // this.initializeForm();
  }

  public diccionarioForm: FormGroup = this.fb.group({
    tabla: ['', [Validators.required, Validators.minLength(2)]],
    campo: ['', [Validators.required, Validators.minLength(2)]],
    campoLargo: [''],
    definicion: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit() {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['diccionario']) {
      this.updateForm();
    }
  }

  // private initializeForm() {
  //   this.diccionarioForm = this.fb.group({
  //     tabla: ['', [Validators.required, Validators.minLength(2)]],
  //     campo: ['', [Validators.required, Validators.minLength(2)]],
  //     campoLargo: [''],
  //     definicion: ['', [Validators.required, Validators.minLength(10)]],
  //   });
  // }

  private updateForm() {
    if (this.diccionario) {
      this.isEditMode = true;
      this.diccionarioForm.patchValue({
        tabla: this.diccionario.tabla || '',
        campo: this.diccionario.campo || '',
        campoLargo: this.diccionario.campoLargo || '',
        definicion: this.diccionario.definicion || '',
      });
    } else {
      this.isEditMode = false;
      this.diccionarioForm.reset();
    }
  }

  // protected isFieldInvalid(fieldName: string): boolean {
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.diccionarioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.diccionarioForm.valid) {
      const formValue = this.diccionarioForm.value;
      this.formSubmit.emit({
        tabla: formValue.tabla.trim(),
        campo: formValue.campo.trim(),
        campoLargo: formValue.campoLargo?.trim() || undefined,
        definicion: formValue.definicion.trim(),
      });
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
