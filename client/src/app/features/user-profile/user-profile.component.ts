import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UserEventsComponent } from './components/user-events/user-events.component';
import { UserSessionsComponent } from './components/user-sessions/user-sessions.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UserSecurityComponent } from './components/user-security/user-security.component';
import { ToolbarComponent, UserFormComponent } from '../../core-ui/components';
import { AuthState, CommonState, selectDepartments, selectProfile } from '../../common/stores';
import { Store } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';
import { combineLatest, filter, map, takeUntil, tap } from 'rxjs';
import { User, UserChangeEmail, UserChangePassword } from '../../common/models';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DriverUrlPipe, GenderPipe, RankPipe } from '../../core-ui/pipes';
import { selectRouterParam } from '../../common/stores/router';
import {
    selectEventPagination,
    selectEvents,
    selectIsLoading,
    selectIsVisible,
    selectIsVisible2FA,
    selectIsVisibleEmail,
    selectIsVisiblePass,
    selectSessionPagination,
    selectSessions,
    selectUser,
    UserProfileState
} from './store/user-profile.reducer';
import { UserProfileActions } from './store/user-profile.actions';
import { NavigationEnd, Router, RouterLink, Scroll } from '@angular/router';
import { concatLatestFrom } from '@ngrx/effects';
import { Role, TwoFactorMethod } from '../../common/constants';
import { ChangeEmailComponent } from './components/change-email/change-email.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangeTwoFactorComponent } from './components/change-two-factor/change-two-factor.component';
import { handleTitle } from '../../common/utilities';
import { Title } from '@angular/platform-browser';
import { DestroyDirective } from '../../core-ui/directives';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [ NgForOf, NgClass, NgIf, NzButtonModule, ToolbarComponent, UserSecurityComponent, UserSessionsComponent, UserEventsComponent, AsyncPipe, JsonPipe, NzSpinModule, DriverUrlPipe, UserFormComponent, DatePipe, RouterLink, ChangeEmailComponent, ChangePasswordComponent, ChangeTwoFactorComponent, GenderPipe, RankPipe ],
    templateUrl: './user-profile.component.html',
    hostDirectives: [ DestroyDirective ],
})
export class UserProfileComponent {
    readonly #destroy$ = inject(DestroyDirective).destroy$;
    readonly #routerStore = inject(Store<RouterReducerState>);
    readonly #authStore = inject(Store<AuthState>);
    readonly #profileStore = inject(Store<UserProfileState>);
    readonly #commonStore = inject(Store<CommonState>);
    readonly #router = inject(Router);
    readonly #title = inject(Title);

    departments$ = this.#commonStore.select(selectDepartments);
    isVisible$ = this.#profileStore.select(selectIsVisible);
    isVisibleEmail$ = this.#profileStore.select(selectIsVisibleEmail);
    isVisiblePass$ = this.#profileStore.select(selectIsVisiblePass);
    isVisible2FA$ = this.#profileStore.select(selectIsVisible2FA);
    isLoading$ = this.#profileStore.select(selectIsLoading);
    user$ = this.#profileStore
        .select(selectUser)
        .pipe(
            tap(user => user && this.#title.setTitle(
                handleTitle(!this.id ? 'Trang cá nhân' : (`${user.rank ? user.rank + '. ' : ''}${user.fullName}` || 'Chi tiết người dùng')))
            )
        );
    sessions$ = this.#profileStore.select(selectSessions);
    sessionPagination$ = this.#profileStore.select(selectSessionPagination);
    events$ = this.#profileStore.select(selectEvents);
    eventsPagination$ = this.#profileStore.select(selectEventPagination);
    isAdministrator$ = this.#authStore.select(selectProfile).pipe(
        map(profile => profile && profile.role == Role.ADMINISTRATOR)
    );
    isSelf$ = combineLatest([
        this.#authStore.select(selectProfile),
        this.#profileStore.select(selectUser)
    ]).pipe(
        map(([profile, user]) => profile && user && profile.id === user.id)
    );
    id = '';

    constructor() {
        this.onLoad();
    }

    onLoad() {
        this.#router.events
            .pipe(
                filter(event => event instanceof Scroll && event.routerEvent instanceof NavigationEnd),
                concatLatestFrom(_ => this.#routerStore.select(selectRouterParam('id'))),
                takeUntil(this.#destroy$)
            )
            .subscribe(([_, id]) => {
                this.id = id || '';
                this.#profileStore.dispatch(UserProfileActions.loadUser());
                const payload: any = {};
                this.id && (payload.userId = this.id);
                this.#profileStore.dispatch(UserProfileActions.loadSessions({ payload }));
                this.#profileStore.dispatch(UserProfileActions.loadEvents({ payload }));
            });
    }

    onEdit() {
        this.#profileStore.dispatch(UserProfileActions.updateVisible({ isVisible: true }));
    }

    onSave(value: User) {
        this.#profileStore.dispatch(this.id
            ? UserProfileActions.updateUser({ payload: value })
            : UserProfileActions.updateProfile({ payload: value })
        );
    }

    onCancel(modal?: 'email' | 'password' | '2fa') {
        this.#profileStore.dispatch(UserProfileActions.updateVisible({ isVisible: false, modal }));
    }

    onEventPageChange(event: { index: number, size: number }) {
        const payload: any = {};
        this.id && (payload.userId = this.id);
        payload.page = event.index;
        payload.limit = event.size;
        this.#profileStore.dispatch(UserProfileActions.loadEvents({ payload }));
    }

    onSessionPageChange(event: { index: number, size: number }) {
        const payload: any = {};
        this.id && (payload.userId = this.id);
        payload.page = event.index;
        payload.limit = event.size;
        this.#profileStore.dispatch(UserProfileActions.loadSessions({ payload }));
    }

    onOpenModal(modal: 'email' | 'password' | '2fa') {
        this.#profileStore.dispatch(UserProfileActions.updateVisible({ isVisible: true, modal }));
    }

    onDeleteSession(payload: { id: number, deviceId: string }) {
        this.#profileStore.dispatch(UserProfileActions.deleteSession({ payload }));
    }

    onVerifyNewEmail(payload: UserChangeEmail) {
        this.#profileStore.dispatch(UserProfileActions.verifyNewEmail({ payload }));
    }

    onChangeEmail(payload: UserChangeEmail) {
        this.#profileStore.dispatch(UserProfileActions.changeEmail({ payload }));
    }

    onChangePass(payload: UserChangePassword) {
        this.#profileStore.dispatch(UserProfileActions.changePassword({ payload }));
    }

    onChange2FA(payload: { id?: number, twoFactory: TwoFactorMethod, isSelf: boolean }) {
        if (this.id) { payload.id = +this.id; }
        this.#profileStore.dispatch(UserProfileActions.change2FA({ payload }));
    }
}
