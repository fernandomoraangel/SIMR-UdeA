import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

// declare var Swal: any;

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  success(title: string, text: string): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    });
  }

  error(title: string, text: string): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Cerrar',
    });
  }

  confirm(
    title: string,
    text: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  }
}
