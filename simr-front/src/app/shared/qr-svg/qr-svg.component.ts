import { Component, Input, OnChanges } from '@angular/core';
import qrcode from 'qrcode-generator';

/**
 * Renderiza un código QR (típicamente un URI `otpauth://totp/...`) como imagen.
 * Usa `qrcode-generator` (librería pura JS, sin depender de Node) y su salida
 * `createDataURL` (GIF autocontenido), por lo que funciona en el navegador sin
 * canvas ni sockets. Es compatible con Microsoft Authenticator / Google
 * Authenticator / Authy.
 */
@Component({
  selector: 'app-qr-svg',
  standalone: true,
  template: `<img class="qr-img" [src]="dataUrl" alt="Código QR" width="{{size}}" height="{{size}}" />`,
  styles: [
    `
      .qr-img {
        image-rendering: pixelated;
        background: #fff;
        padding: 8px;
        border: 1px solid rgba(0, 0, 0, 0.18);
        border-radius: 6px;
      }
    `,
  ],
})
export class QrSvgComponent implements OnChanges {
  @Input() value: string = '';
  @Input() size = 220;

  dataUrl = '';

  ngOnChanges(): void {
    this.dataUrl = this.buildDataUrl(this.value);
  }

  private buildDataUrl(value: string): string {
    if (!value) {
      return '';
    }
    try {
      const qr = qrcode(0, 'M');
      qr.addData(value); // Modo Byte por defecto
      qr.make();
      return qr.createDataURL(4, 2);
    } catch (e) {
      console.error('Error generando el código QR:', e);
      return '';
    }
  }
}