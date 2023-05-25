import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationPayload, PaginationResponse, User, UserEvent, UserSession } from '../../../common/models';

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

        'Update Visible': props<{ isVisible: boolean }>(),

        'Load Sessions': props<{ payload: PaginationPayload }>(),
        'Load Sessions Success': props<{ response: PaginationResponse<UserSession> }>(),
        'Load Sessions Failure': props<{ errors: any }>(),

        'Load Events': props<{ payload: PaginationPayload }>(),
        'Load Events Success': props<{ response: PaginationResponse<UserEvent> }>(),
        'Load Events Failure': props<{ errors: any }>(),
    }
});

