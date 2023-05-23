import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Department, PaginationPayload, PaginationResponse, Semester, Student, User } from '../../models';

export const CommonActions = createActionGroup({
    source: 'Common',
    events: {
        'Load Departments': emptyProps(),
        'Load Departments Success': props<{ response: Department[] }>(),
        'Load Departments Failure': props<{ errors: any }>(),

        'Load Semesters': emptyProps(),
        'Load Semesters Success': props<{ response: Semester[] }>(),
        'Load Semesters Failure': props<{ errors: any }>(),

        'Search Students': props<{ payload: PaginationPayload }>(),
        'Search Students Success': props<{ response: PaginationResponse<Student> }>(),
        'Search Students Failure': props<{ errors: any }>(),

        'Search Users': props<{ payload: PaginationPayload }>(),
        'Search Users Success': props<{ response: PaginationResponse<User> }>(),
        'Search Users Failure': props<{ errors: any }>()
    }
})

