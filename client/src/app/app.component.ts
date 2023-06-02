import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthState, selectAuthLoading } from './common/stores';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-root',
    template: `
    <router-outlet/>
    <div class="fixed z-[9999] top-0 left-0 right-0 bottom-0 bg-black/75" *ngIf="isLoading$ | async">
      <div class="w-full h-full flex items-center justify-center">
        <div class="w-24 h-24 rounded-full bg-primary relative p-2 flex items-center justify-center">
          <img class="w-full h-full object-contain" src="assets/images/logos/logo-1.png" alt=""/>
            <div class="absolute rounded-full border-[#ED7E01] border-[3px] border inset-1 border-l-transparent animate-spin"></div>
          </div>
        </div>
    </div>
  `,
    imports: [ RouterOutlet, AsyncPipe, NgIf ],
    standalone: true
})
export class AppComponent {
    readonly #store = inject(Store<AuthState>);
    readonly isLoading$ = this.#store.select(selectAuthLoading);
}
