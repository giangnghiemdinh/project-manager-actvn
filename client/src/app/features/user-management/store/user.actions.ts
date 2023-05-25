import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationResponse, User, UserImportPayload } from '../../../common/models';
import { UserStatus } from '../../../common/constants';

export const UserActions = createActionGroup({
    source: 'User',
    events: {
        'Load Users': emptyProps(),
        'Load Users Success': props<{ response: PaginationResponse<User> }>(),
        'Load Users Failure': props<{ errors: any }>(),

        'Load User': props<{ payload: { id: number } }>(),
        'Load User Success': props<{ response: User }>(),
        'Load User Failure': props<{ errors: any }>(),

        'Create User': props<{ payload: User }>(),
        'Create User Success': props<{ response: User }>(),
        'Create User Failure': props<{ errors: any }>(),

        'Update User': props<{ payload: User }>(),
        'Update User Success': props<{ response: User }>(),
        'Update User Failure': props<{ errors: any }>(),

        'Change Status User': props<{ payload: { id: number, status: UserStatus } }>(),
        'Change Status User Success': emptyProps(),
        'Change Status User Failure': props<{ errors: any }>(),

        'Import User': props<{ payload: UserImportPayload }>(),
        'Import User Success': emptyProps(),
        'Import User Failure': props<{ errors: any }>(),

        'Update Visible': props<{ isVisible: boolean }>(),
        'Update Import Visible': props<{ isVisible: boolean }>()
    }
});
