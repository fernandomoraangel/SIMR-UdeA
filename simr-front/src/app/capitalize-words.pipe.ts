import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalizeWords',
    standalone: false
})
export class CapitalizeWordsPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return ''; // Manejo de casos donde el valor es null o undefined

    value = value.toLowerCase(); // Convertir a minúsculas
    return value
      .split(' ') // Divide el string en un array de palabras
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar la primera letra de cada palabra
      .join(' '); // Une las palabras capitalizadas en un solo string
  }

}
