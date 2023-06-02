import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationResponse, Student, StudentImport } from '../../../common/models';

export const StudentActions = createActionGroup({
    source: 'Student',
    events: {
        'Load Students': emptyProps(),
        'Load Students Success': props<{ response: PaginationResponse<Student> }>(),
        'Load Students Failure': props<{ errors: any }>(),

        'Load Student': props<{ payload: { id: number } }>(),
        'Load Student Success': props<{ response: Student }>(),
        'Load Student Failure': props<{ errors: any }>(),

        'Create Student': props<{ payload: Student }>(),
        'Create Student Success': props<{ response: Student }>(),
        'Create Student Failure': props<{ errors: any }>(),

        'Update Student': props<{ payload: Student }>(),
        'Update Student Success': emptyProps(),
        'Update Student Failure': props<{ errors: any }>(),

        'Delete Student': props<{ payload: { id: number } }>(),
        'Delete Student Success': emptyProps(),
        'Delete Student Failure': props<{ errors: any }>(),

        'Import Student': props<{ payload: StudentImport }>(),
        'Import Student Success': emptyProps(),
        'Import Student Failure': props<{ errors: any }>(),

        'Update Visible': props<{ isVisible: boolean }>(),
        'Update Visible Import': props<{ isVisible: boolean }>(),

    }
});
