import { Component, input, output, model, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <div class="filter-bar">
      <mat-form-field appearance="outline" class="filter-search">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [placeholder]="placeholder()" [(ngModel)]="search" (input)="onSearch()" />
        @if (search) {
          <button matSuffix mat-icon-button (click)="clear()" type="button" aria-label="Limpiar">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .filter-search { flex: 1; min-width: 200px; max-width: 380px; margin-bottom: 0; }
  `],
})
export class FilterBarComponent {
  placeholder = input('Buscar...');
  readonly searchValue = model<string>('');
  readonly searchChange = output<string>();

  protected search = '';

  private debouncer = new Subject<string>();
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.debouncer.pipe(debounceTime(300), distinctUntilChanged()).subscribe((v) => {
      this.searchValue.set(v);
      this.searchChange.emit(v);
    });
    this.destroyRef.onDestroy(() => this.debouncer.complete());
  }

  onSearch() {
    this.debouncer.next(this.search);
  }

  clear() {
    this.search = '';
    this.debouncer.next('');
  }
}
