import { Component, Input } from '@angular/core';

/**
 * Firma visual de SIMR: una onda sonora dibujada en SVG.
 * Representa "músicas regionales" — el material real del archivo.
 * Se anima con un barrido de trazo; respeta prefers-reduced-motion.
 */
@Component({
  selector: 'app-sound-wave',
  standalone: true,
  template: `
    <svg
      class="wave"
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      [attr.width]="width"
      [attr.height]="height"
      preserveAspectRatio="none"
      role="img"
      aria-label="Onda sonora"
    >
      <path
        class="wave-path"
        [attr.d]="path"
        fill="none"
        [attr.stroke]="color"
        stroke-width="2"
        stroke-linecap="round"
        [class.animated]="animated"
      />
    </svg>
  `,
  styles: [
    `
      .wave {
        display: block;
      }
      .wave-path {
        stroke-dasharray: var(--len, 1200);
        stroke-dashoffset: 0;
      }
      .wave-path.animated {
        animation: simr-draw 2.4s ease-out forwards;
      }
      @keyframes simr-draw {
        from {
          stroke-dashoffset: var(--len, 1200);
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .wave-path.animated {
          animation: none;
        }
      }
    `,
  ],
})
export class SoundWaveComponent {
  @Input() width = 240;
  @Input() height = 48;
  @Input() color = '#b5432a';
  @Input() animated = true;

  /** Genera una onda suave tipo forma de onda de audio. */
  get path(): string {
    const w = this.width;
    const h = this.height;
    const mid = h / 2;
    const seg = 12;
    const step = w / seg;
    const amps = [0.15, 0.55, 0.9, 0.4, 0.75, 1, 0.5, 0.85, 0.3, 0.65, 0.45, 0.2];
    let d = `M 0 ${mid}`;
    for (let i = 0; i < seg; i++) {
      const x0 = i * step;
      const x1 = x0 + step;
      const peak = mid - amps[i] * (mid - 3);
      const trough = mid + amps[i] * (mid - 3);
      d += ` Q ${x0 + step / 2} ${peak} ${x1} ${mid}`;
      d += ` Q ${x1 + step / 2} ${trough} ${x1 + step} ${mid}`;
    }
    return d;
  }
}
