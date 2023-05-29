import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
    PaginationPayload,
    PaginationResponse,
    User,
    UserChangeEmail,
    UserChangePassword,
    UserEvent,
    UserSession
} from '../../../common/models';
import { TwoFactorMethod } from '../../../common/constants';

type modal = 'email' | 'password' | '2fa';

export const UserProfileActions = createActionGroup({
    source: 'User Profile',
    events: {
        'Load User': emptyProps(),
        'Load User Success': props<{ response: User }>(),
        'Load User Failure': props<{ errors: any }>(),

        'Update User': props<{ payload: User }>(),
        'Update User Success': props<{ response: User }>(),
        'Update User Failure': props<{ errors: any }>(),

        'Update Profile': props<{ payload: User }>(),
        'Update Profile Success': props<{ response: User }>(),
        'Update Profile Failure': props<{ errors: any }>(),

        'Update Visible': props<{ isVisible: boolean, modal?: modal }>(),

        'Load Sessions': props<{ payload: PaginationPayload }>(),
        'Load Sessions Success': props<{ response: PaginationResponse<UserSession> }>(),
        'Load Sessions Failure': props<{ errors: any }>(),

        'Load Events': props<{ payload: PaginationPayload }>(),
        'Load Events Success': props<{ response: PaginationResponse<UserEvent> }>(),
        'Load Events Failure': props<{ errors: any }>(),

        'Verify New Email': props<{ payload: UserChangeEmail }>(),
        'Verify New Email Success': emptyProps(),
        'Verify New Email Failure': props<{ errors: any }>(),

        'Change Email': props<{ payload: UserChangeEmail }>(),
        'Change Email Success': emptyProps(),
        'Change Email Failure': props<{ errors: any }>(),

        'Change Password': props<{ payload: UserChangePassword }>(),
        'Change Password Success': emptyProps(),
        'Change Password Failure': props<{ errors: any }>(),

        'Change 2FA': props<{ payload: { id?: number, twoFactory: TwoFactorMethod, isSelf: boolean } }>(),
        'Change 2FA Success': props<{ isSelf: boolean }>(),
        'Change 2FA Failure': props<{ errors: any }>(),

        'Delete Session': props<{ payload: { id: number, deviceId: string } }>(),
        'Delete Session Success': props<{ deviceId: string }>(),
        'Delete Session Failure': props<{ errors: any }>(),
    }
});

