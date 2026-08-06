import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="collapsible" [class.collapsed]="collapsed">
      <button class="collapsible-header" (click)="toggle()" type="button">
        <span class="header-content">
          @if (icon) {
            <mat-icon class="header-icon">{{ icon }}</mat-icon>
          }
          <span class="header-title">{{ title }}</span>
        </span>
        <mat-icon class="collapse-arrow">keyboard_arrow_down</mat-icon>
      </button>
      <div class="collapsible-body" [class.open]="!collapsed">
        <div class="collapsible-inner">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collapsible {
      border-bottom: 1px solid var(--mat-sys-outline);
    }
    .collapsible:last-of-type {
      border-bottom: none;
    }
    .collapsible-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--simr-tinta);
      font-family: var(--simr-body);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: background 0.2s;
    }
    .collapsible-header:hover {
      background: rgba(200, 119, 46, 0.04);
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--simr-cobre);
    }
    .collapse-arrow {
      transition: transform 0.25s ease;
      color: var(--simr-musgo);
    }
    .collapsed .collapse-arrow {
      transform: rotate(-90deg);
    }
    .collapsible-body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s ease;
      padding: 0;
    }
    .collapsible-inner {
      overflow: hidden;
      min-height: 0;
    }
    .collapsible-body.open {
      grid-template-rows: 1fr;
      padding: 0 0 1.25rem;
    }
  `],
})
export class CollapsibleSectionComponent {
  @Input({ required: true }) title = '';
  @Input() icon = '';
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
