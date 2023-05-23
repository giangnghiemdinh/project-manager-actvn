import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../services';
import { Store } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';
import { Actions } from '@ngrx/effects';

@Injectable({
  providedIn: 'root'
})
export class AbstractEffects {
  protected readonly notification = inject(NotificationService);
  protected readonly routerStore = inject(Store<RouterReducerState>);
  protected readonly actions$ = inject(Actions);

  raiseSuccess(message: string) {
    this.notification.success(message);
  }
}
