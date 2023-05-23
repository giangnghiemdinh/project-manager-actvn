import { Component, inject, OnDestroy } from '@angular/core';
import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UserEventsComponent } from './components/user-events/user-events.component';
import { UserSessionsComponent } from './components/user-sessions/user-sessions.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UserSecurityComponent } from './components/user-security/user-security.component';
import { ToolbarComponent, UserFormComponent } from '../../core-ui/components';
import { AuthState, CommonState, selectDepartments } from '../../common/stores';
import { Store } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { User } from '../../common/models';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DriverUrlPipe, RolePipe } from '../../core-ui/pipes';
import { selectRouterParam } from '../../common/stores/router';
import {
    selectEventPagination,
    selectEvents,
    selectIsLoading,
    selectIsVisible,
    selectSessionPagination,
    selectSessions,
    selectUser,
    UserProfileState
} from './store/user-profile.reducer';
import { UserProfileActions } from './store/user-profile.actions';
import { NavigationEnd, Router, RouterLink, Scroll } from '@angular/router';
import { concatLatestFrom } from '@ngrx/effects';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [ NgForOf, NgClass, NgIf, NzButtonModule, ToolbarComponent, UserSecurityComponent, UserSessionsComponent, UserEventsComponent, AsyncPipe, JsonPipe, NzSpinModule, DriverUrlPipe, UserFormComponent, DatePipe, RouterLink, RolePipe ],
    templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnDestroy {
    private readonly destroy$ = new ReplaySubject<void>(1);
    private readonly routerStore = inject(Store<RouterReducerState>);
    private readonly authStore = inject(Store<AuthState>);
    private readonly profileStore = inject(Store<UserProfileState>);
    private readonly commonStore = inject(Store<CommonState>);
    private readonly router = inject(Router);

    departments$ = this.commonStore.select(selectDepartments);
    isVisible$ = this.profileStore.select(selectIsVisible);
    isLoading$ = this.profileStore.select(selectIsLoading);
    user$ = this.profileStore.select(selectUser);
    sessions$ = this.profileStore.select(selectSessions);
    sessionPagination$ = this.profileStore.select(selectSessionPagination);
    events$ = this.profileStore.select(selectEvents);
    eventsPagination$ = this.profileStore.select(selectEventPagination);
    id = '';

    constructor() {
        this.onLoad();
    }

    onLoad() {
        this.router.events
            .pipe(
                filter(event => event instanceof Scroll && event.routerEvent instanceof NavigationEnd),
                concatLatestFrom(_ => this.routerStore.select(selectRouterParam('id'))),
                takeUntil(this.destroy$)
            )
            .subscribe(([_, id]) => {
                this.id = id || '';
                this.profileStore.dispatch(UserProfileActions.loadUser());
                const payload: any = {};
                this.id && (payload.userId = this.id);
                this.profileStore.dispatch(UserProfileActions.loadSessions({ payload }));
                this.profileStore.dispatch(UserProfileActions.loadEvents({ payload }));
            });
    }

    onEdit() {
        this.profileStore.dispatch(UserProfileActions.updateVisible({ isVisible: true }));
    }

    onSave(value: User) {
        this.profileStore.dispatch(UserProfileActions.updateUser({ payload: value }));
    }

    onClose() {
        this.profileStore.dispatch(UserProfileActions.updateVisible({ isVisible: false }));
    }

    onEventPageChange(event: { index: number, size: number }) {
        const payload: any = {};
        this.id && (payload.userId = this.id);
        payload.page = event.index;
        payload.limit = event.size;
        this.profileStore.dispatch(UserProfileActions.loadEvents({ payload }));
    }

    onSessionPageChange(event: { index: number, size: number }) {
        const payload: any = {};
        this.id && (payload.userId = this.id);
        payload.page = event.index;
        payload.limit = event.size;
        this.profileStore.dispatch(UserProfileActions.loadSessions({ payload }));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
