import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Department } from '../../../common/models';

export const DepartmentActions = createActionGroup({
    source: 'Department',
    events: {
        'Update Visible': props<{ isVisible: boolean }>(),

        'Load Department': props<{ payload: { id: number } }>(),
        'Load Department Success': props<{ response: Department }>(),
        'Load Department Failure': props<{ errors: any }>(),

        'Create Department': props<{ payload: Department }>(),
        'Create Department Success': props<{ response: Department }>(),
        'Create Department Failure': props<{ errors: any }>(),

        'Update Department': props<{ payload: Department }>(),
        'Update Department Success': emptyProps(),
        'Update Department Failure': props<{ errors: any }>(),

        'Delete Department': props<{ id: number }>(),
        'Delete Department Success': emptyProps(),
        'Delete Department Failure': props<{ errors: any }>()
    }
})
