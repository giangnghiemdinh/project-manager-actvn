import { ChangeDetectorRef, Component, inject, TemplateRef } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { LAYOUT_CONFIG } from '../../common/constants';
import { Store } from '@ngrx/store';
import { AuthActions, AuthState, CommonActions, CommonState, selectProfile } from '../../common/stores';
import { AsyncPipe, NgIf } from '@angular/common';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { media } from '../../common/utilities';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    templateUrl: './auth-layout.component.html',
    imports: [
        HeaderComponent,
        SidebarComponent,
        RouterOutlet,
        AsyncPipe,
        NzBackTopModule,
        NgIf,
        FooterComponent
    ]
})
export class AuthLayoutComponent {
    readonly #store = inject(Store<AuthState>);
    readonly #commonStore = inject(Store<CommonState>);
    readonly cdr = inject(ChangeDetectorRef);
    profile$ = this.#store.select(selectProfile);
    isDesktop = true;
    isFixedSidebar = true;
    isCollapsedSidebar = false;
    CONFIG = LAYOUT_CONFIG;
    footer: TemplateRef<any> | null = null;

    constructor() {
        this.#commonStore.dispatch(CommonActions.loadDepartments());
        this.#commonStore.dispatch(CommonActions.loadSemesters());
        this.mediaListener();
    }

    onLogout() {
        this.#store.dispatch(AuthActions.logout());
    }

    private mediaListener() {
        media(`(min-width: 1024px)`)
            .pipe(takeUntilDestroyed())
            .subscribe(isDesktop => this.isDesktop = isDesktop);
    }

    protected readonly TemplateRef = TemplateRef;
}
