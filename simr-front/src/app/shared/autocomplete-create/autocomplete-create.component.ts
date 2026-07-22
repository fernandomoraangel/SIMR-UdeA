import { Component, Input, Output, EventEmitter, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, of, startWith, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AutocompleteItem {
  _id: string;
  nombre: string;
  [key: string]: any;
}

@Component({
  selector: 'app-autocomplete-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDialogModule,
  ],
  template: `
    <div class="autocomplete-create">
      <mat-form-field appearance="outline" class="ac-field" subscriptSizing="dynamic">
        <mat-label>{{ placeholder }}</mat-label>
        <input
          matInput
          [ngModel]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
          [matAutocomplete]="auto"
          (input)="onInput()"
          #inputField
        />
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event)" [displayWith]="displayFn">
          @for (item of filteredItems$ | async; track item._id) {
            <mat-option [value]="item">
              {{ item[displayField] }}
            </mat-option>
          }
              @if ((filteredItems$ | async)?.length === 0 && searchTerm.trim()) {
            <mat-option disabled class="no-result">
              <span>Sin resultados para "{{ searchTerm }}"</span>
            </mat-option>
          }
        </mat-autocomplete>
        @if (searchTerm.trim() && !isExisting()) {
          <button
            matSuffix
            mat-icon-button
            type="button"
            class="create-btn"
            (click)="openCreateDialog($event)"
            title="Crear nuevo"
          >
            <mat-icon>add_circle</mat-icon>
          </button>
        }
      </mat-form-field>

      @if (selected.length > 0) {
        <div class="chips-list">
          @for (item of selected; track item._id) {
            <mat-chip-row (removed)="remove(item)" class="item-chip">
              {{ item[displayField] }}
              <button matChipRemove aria-label="Eliminar">
                <mat-icon>close</mat-icon>
              </button>
            </mat-chip-row>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .autocomplete-create { display: flex; flex-direction: column; gap: 0.5rem; }
    .ac-field { width: 100%; }
    .create-btn { color: var(--simr-cobre); }
    .chips-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    :host ::ng-deep .item-chip {
      background: var(--simr-papel) !important;
      border: 1px solid var(--mat-sys-outline) !important;
    }
    .no-result {
      font-size: 0.85rem;
      color: var(--simr-tinta-2);
      padding: 0.5rem 1rem;
    }
  `],
})
export class AutocompleteCreateComponent implements OnInit {
  @Input({ required: true }) apiEndpoint = '';
  @Input() placeholder = 'Buscar…';
  @Input() selected: AutocompleteItem[] = [];
  @Input() displayField = 'nombre';

  @Output() selectedChange = new EventEmitter<AutocompleteItem[]>();

  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  searchTerm = '';
  allItems: AutocompleteItem[] = [];
  private searchTerms$ = new BehaviorSubject<string>('');
  filteredItems$!: Observable<AutocompleteItem[]>;

  ngOnInit() {
    this.loadItems();
    this.filteredItems$ = this.searchTerms$.pipe(
      startWith(''),
      debounceTime(150),
      distinctUntilChanged(),
      switchMap((term) => {
        const t = term.toLowerCase();
        const filtered = this.allItems.filter(
          (i) => (i[this.displayField]?.toLowerCase() || '').includes(t) && !this.selected.find((s) => s._id === i._id)
        );
        return of(filtered);
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  displayFn(item: AutocompleteItem): string {
    return item?.[this.displayField] || '';
  }

  private loadItems() {
    const url = `${environment.apiUrl}/${this.apiEndpoint}`;
    this.http.get<AutocompleteItem[]>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items) => {
        this.allItems = items || [];
      },
    });
  }

  onInput() {
    this.searchTerms$.next(this.searchTerm);
  }

  onSearchChange(val: any) {
    if (typeof val === 'string') {
      this.searchTerm = val;
    }
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    const item = event.option.value as AutocompleteItem;
    if (!this.selected.find((s) => s._id === item._id)) {
      this.selected = [...this.selected, item];
      this.selectedChange.emit(this.selected);
    }
    setTimeout(() => (this.searchTerm = ''));
  }

  isExisting(): boolean {
    if (!this.searchTerm?.trim()) return false;
    const term = this.searchTerm.toLowerCase();
    return this.allItems.some((i) => (i[this.displayField]?.toLowerCase() || '') === term);
  }

  remove(item: AutocompleteItem) {
    this.selected = this.selected.filter((s) => s._id !== item._id);
    this.selectedChange.emit(this.selected);
  }

  openCreateDialog(event: MouseEvent) {
    event.stopPropagation();
    const term = this.searchTerm?.trim();
    if (!term) return;

    // For now just create via API and add to the list
    this.http
      .post<AutocompleteItem>(`${environment.apiUrl}/${this.apiEndpoint}`, {
        [this.displayField]: term,
      })
      .subscribe({
        next: (created) => {
          this.allItems = [...this.allItems, created];
          this.selected = [...this.selected, created];
          this.selectedChange.emit(this.selected);
          this.searchTerm = '';
        },
      });
  }
}
