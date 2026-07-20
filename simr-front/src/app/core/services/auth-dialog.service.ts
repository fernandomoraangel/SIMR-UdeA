import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent, AuthDialogData } from '@shared/auth-dialog/auth-dialog.component';

@Injectable({ providedIn: 'root' })
export class AuthDialogService {
  constructor(private dialog: MatDialog) {}

  open(mode: 'login' | 'signup' = 'login'): void {
    const data: AuthDialogData = { mode };
    this.dialog.open(AuthDialogComponent, {
      data,
      panelClass: 'simr-auth-dialog',
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
