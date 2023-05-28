import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Semester } from '../../../common/models';

export const SemesterActions = createActionGroup({
    source: 'Semester',
    events: {
        'Update Visible': props<{ isVisible: boolean }>(),

        'Load Semester': props<{ payload: { id: number } }>(),
        'Load Semester Success': props<{ response: Semester }>(),
        'Load Semester Failure': props<{ errors: any }>(),

        'Create Semester': props<{ payload: Semester }>(),
        'Create Semester Success': props<{ response: Semester }>(),
        'Create Semester Failure': props<{ errors: any }>(),

        'Update Semester': props<{ payload: Semester }>(),
        'Update Semester Success': emptyProps(),
        'Update Semester Failure': props<{ errors: any }>(),

        'Delete Semester': props<{ id: number }>(),
        'Delete Semester Success': emptyProps(),
        'Delete Semester Failure': props<{ errors: any }>(),

        'Lock Semester': props<{ id: number }>(),
        'Lock Semester Success': emptyProps(),
        'Lock Semester Failure': props<{ errors: any }>(),
    }
});
