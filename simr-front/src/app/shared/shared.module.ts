import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { CapitalizeWordsPipe } from '../capitalize-words.pipe';


@NgModule({
  declarations: [
    CapitalizeWordsPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CapitalizeWordsPipe
  ]
})
export class SharedModule { }
