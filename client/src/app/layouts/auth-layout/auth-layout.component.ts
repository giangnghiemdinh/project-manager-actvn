import { ChangeDetectorRef, Component, inject, TemplateRef } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { LAYOUT_CONFIG } from '../../common/constants';
import { Store } from '@ngrx/store';
import {
    AuthActions,
    AuthState,
    CommonActions,
    CommonState,
    selectActiveTheme,
    selectIsFixedSidebar,
    selectProfile,
    selectSettingsLoading,
    selectTheme,
    SettingsActions,
    SettingsState
} from '../../common/stores';
import { AsyncPipe, NgIf } from '@angular/common';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { media } from '../../common/utilities';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from './components/footer/footer.component';
import { LetDirective } from '../../core-ui/directives';
import { first } from 'rxjs';

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
        FooterComponent,
        LetDirective
    ]
})
export class AuthLayoutComponent {
    readonly #store = inject(Store<AuthState>);
    readonly #commonStore = inject(Store<CommonState>);
    readonly #settingsStore = inject(Store<SettingsState>);
    readonly cdr = inject(ChangeDetectorRef);
    profile$ = this.#store.select(selectProfile);
    theme$ = this.#settingsStore.select(selectTheme);
    activeTheme$ = this.#settingsStore.select(selectActiveTheme);
    isLoadingTheme$ = this.#settingsStore.select(selectSettingsLoading);
    isFixedSidebar$ = this.#settingsStore.select(selectIsFixedSidebar);
    isDesktop = true;
    isCollapsedSidebar = false;
    CONFIG = LAYOUT_CONFIG;
    footer: TemplateRef<any> | null = null;

    constructor() {
        this.#commonStore.dispatch(CommonActions.loadDepartments());
        this.#commonStore.dispatch(CommonActions.loadSemesters());
        this.isFixedSidebar$.pipe(first())
            .subscribe(isFixed => !isFixed && (this.isCollapsedSidebar = true));
        this.mediaListener();
    }

    onLogout() {
        this.#store.dispatch(AuthActions.logout());
    }

    onChangeFixedSidebar(isFixed: boolean) {
        this.#settingsStore.dispatch(SettingsActions.changeFixedSidebar({ isFixed }));
    }

    onChangeTheme(theme: 'light' | 'dark' | 'system') {
        this.#settingsStore.dispatch(SettingsActions.changeTheme({ theme }));
    }

    private mediaListener() {
        media(`(min-width: 1024px)`)
            .pipe(takeUntilDestroyed())
            .subscribe(isDesktop => this.isDesktop = isDesktop);
    }
}
