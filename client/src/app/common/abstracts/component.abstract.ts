import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { MetaPagination } from '../models';
import { RouterState } from '@angular/router';
import { selectQueryParams } from '../stores/router';
import { setTitle } from '../utilities';
import { Action } from '../constants/common.constant';

@Component({
  template: '',
  standalone: true,
})
export class AbstractComponent<S, D> {
  readonly #routerStore = inject(Store<RouterState>);
  readonly #store = inject(Store<S>);
  readonly #modal = inject(NzModalService);
  queryParams$ = this.#routerStore.select(selectQueryParams);
  listOfData!: Observable<D[]>;
  pagination!: Observable<MetaPagination>;
  data$!: Observable<D>;
  isLoading$!: Observable<boolean>;
  isVisible$!: Observable<boolean>;
  action$!: Observable<Action>;
  title = '';
  url = '';

  constructor() {
    setTitle(this.title);
  }
}
