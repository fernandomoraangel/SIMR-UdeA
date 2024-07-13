import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió algún problema; por favor, intente de nuevo luego.';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error.message);
    } else {
      // // The backend returned an unsuccessful response code
      // console.error(
      //   `Backend returned code ${error.status}, ` +
      //   `body was: ${JSON.stringify(error.error)}`);
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    // return an observable with a user-facing error message

    // Verifica si el error es un HTML y ajusta el mensaje de error
    if (typeof error.error === 'string' && error.error.startsWith('<!DOCTYPE html>')) {
      errorMessage = 'Error inesperado en el servidor.';
    } else if (error.error.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
