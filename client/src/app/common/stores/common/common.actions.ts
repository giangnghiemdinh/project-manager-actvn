import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Department, Semester } from '../../models';

export const CommonActions = createActionGroup({
    source: 'Common',
    events: {
        'Load Departments': emptyProps(),
        'Load Departments Success': props<{ response: Department[] }>(),
        'Load Departments Failure': props<{ errors: any }>(),

        'Load Semesters': emptyProps(),
        'Load Semesters Success': props<{ response: Semester[] }>(),
        'Load Semesters Failure': props<{ errors: any }>(),
    }
})

